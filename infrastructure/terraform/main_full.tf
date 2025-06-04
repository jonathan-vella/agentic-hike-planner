terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.84"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.4"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = var.environment != "prod"
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Generate random suffix for globally unique names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Data source to get current client configuration
data "azurerm_client_config" "current" {}

# Get the resource group
data "azurerm_resource_group" "main" {
  name = "${var.app_name}-rg-${var.environment}"
}

# Local values for resource naming
locals {
  resource_suffix = random_string.suffix.result
  common_tags = merge(var.tags, {
    Environment = var.environment
  })
  
  # Environment-specific settings
  env_settings = {
    dev = {
      consistency_level              = "Session"
      enable_automatic_failover      = false
      enable_multiple_write_locations = false
      backup_interval_minutes        = 1440
      backup_retention_hours         = 168
      backup_storage_redundancy      = "Local"
      is_zone_redundant             = false
      sku_name                      = "B1"
      always_on                     = false
    }
    staging = {
      consistency_level              = "Session"
      enable_automatic_failover      = true
      enable_multiple_write_locations = false
      backup_interval_minutes        = 1440
      backup_retention_hours         = 168
      backup_storage_redundancy      = "Local"
      is_zone_redundant             = false
      sku_name                      = "B1"
      always_on                     = false
    }
    prod = {
      consistency_level              = "BoundedStaleness"
      enable_automatic_failover      = true
      enable_multiple_write_locations = true
      backup_interval_minutes        = 240
      backup_retention_hours         = 720
      backup_storage_redundancy      = "Geo"
      is_zone_redundant             = true
      sku_name                      = "B2"
      always_on                     = true
    }
  }
}

# Cosmos DB Account
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.app_name}-cosmos-${var.environment}-${local.resource_suffix}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_free_tier         = var.enable_cosmos_db_free_tier
  enable_automatic_failover = local.env_settings[var.environment].enable_automatic_failover
  enable_multiple_write_locations = local.env_settings[var.environment].enable_multiple_write_locations

  capabilities {
    name = var.cosmos_db_throughput_mode == "serverless" ? "EnableServerless" : null
  }

  consistency_policy {
    consistency_level       = local.env_settings[var.environment].consistency_level
    max_interval_in_seconds = local.env_settings[var.environment].consistency_level == "BoundedStaleness" ? 5 : null
    max_staleness_prefix    = local.env_settings[var.environment].consistency_level == "BoundedStaleness" ? 10 : null
  }

  geo_location {
    location          = var.location
    failover_priority = 0
    zone_redundant    = local.env_settings[var.environment].is_zone_redundant
  }

  backup {
    type                = "Periodic"
    interval_in_minutes = local.env_settings[var.environment].backup_interval_minutes
    retention_in_hours  = local.env_settings[var.environment].backup_retention_hours
    storage_redundancy  = local.env_settings[var.environment].backup_storage_redundancy
  }

  tags = local.common_tags
}

# Cosmos DB SQL Database
resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "HikePlannerDB"
  resource_group_name = data.azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name

  dynamic "autoscale_settings" {
    for_each = var.cosmos_db_throughput_mode == "provisioned" ? [1] : []
    content {
      max_throughput = var.cosmos_db_max_throughput
    }
  }

  dynamic "throughput" {
    for_each = var.cosmos_db_throughput_mode == "provisioned" ? [] : [1]
    content {
      throughput = var.cosmos_db_min_throughput
    }
  }
}

# Container definitions
locals {
  containers = [
    {
      name          = "users"
      partition_key = "/partitionKey"
      indexes = [
        "/email/?",
        "/fitnessLevel/?",
        "/location/region/?",
        "/createdAt/?"
      ]
      default_ttl = null
    },
    {
      name          = "trips"
      partition_key = "/partitionKey"
      indexes = [
        "/userId/?",
        "/status/?",
        "/dates/startDate/?",
        "/dates/endDate/?",
        "/location/region/?",
        "/createdAt/?"
      ]
      default_ttl = null
    },
    {
      name          = "trails"
      partition_key = "/partitionKey"
      indexes = [
        "/characteristics/difficulty/?",
        "/characteristics/distance/?",
        "/characteristics/duration/?",
        "/location/region/?",
        "/location/country/?",
        "/ratings/average/?",
        "/isActive/?"
      ]
      default_ttl = null
    },
    {
      name          = "recommendations"
      partition_key = "/partitionKey"
      indexes = [
        "/userId/?",
        "/tripId/?",
        "/confidence/?",
        "/createdAt/?",
        "/expiresAt/?"
      ]
      default_ttl = 2592000  # 30 days
    }
  ]
}

# Cosmos DB SQL Containers
resource "azurerm_cosmosdb_sql_container" "main" {
  for_each = { for container in local.containers : container.name => container }

  name                  = each.value.name
  resource_group_name   = data.azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.main.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = each.value.partition_key
  partition_key_version = 1
  default_ttl           = each.value.default_ttl

  indexing_policy {
    indexing_mode = "consistent"

    dynamic "included_path" {
      for_each = each.value.indexes
      content {
        path = included_path.value
      }
    }

    excluded_path {
      path = "/*"
    }
  }

  dynamic "autoscale_settings" {
    for_each = var.cosmos_db_throughput_mode == "provisioned" ? [1] : []
    content {
      max_throughput = var.cosmos_db_max_throughput / 4  # Split throughput across containers
    }
  }

  dynamic "throughput" {
    for_each = var.cosmos_db_throughput_mode == "provisioned" ? [] : [1]
    content {
      throughput = var.cosmos_db_min_throughput
    }
  }
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-logs-${var.environment}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days
  daily_quota_gb      = var.daily_log_quota_gb

  tags = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights-${var.environment}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = local.common_tags
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "${var.app_name}-kv-${var.environment}-${local.resource_suffix}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  enabled_for_deployment          = true
  enabled_for_template_deployment = true
  enable_rbac_authorization       = true
  soft_delete_retention_days      = var.environment == "prod" ? 90 : 7
  purge_protection_enabled        = var.environment == "prod"

  public_network_access_enabled = true

  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }

  tags = local.common_tags
}

# Storage Account
resource "azurerm_storage_account" "main" {
  name                     = "${replace(var.app_name, "-", "")}st${var.environment}${local.resource_suffix}"
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  account_kind             = "StorageV2"
  access_tier              = "Hot"

  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = true
  shared_access_key_enabled       = true
  public_network_access_enabled   = true

  blob_properties {
    delete_retention_policy {
      days = var.environment == "prod" ? 30 : 7
    }
    container_delete_retention_policy {
      days = var.environment == "prod" ? 30 : 7
    }
  }

  tags = local.common_tags
}

# Storage Containers
resource "azurerm_storage_container" "trail_images" {
  name                  = "trail-images"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

resource "azurerm_storage_container" "trail_data" {
  name                  = "trail-data"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-plan-${var.environment}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = local.env_settings[var.environment].sku_name

  tags = local.common_tags
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = "${var.app_name}-api-${var.environment}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on         = local.env_settings[var.environment].always_on
    health_check_path = "/health"
    
    application_stack {
      node_version = "18-lts"
    }

    app_settings = {
      "NODE_ENV"                             = var.environment == "prod" ? "production" : "development"
      "AZURE_COSMOS_DB_ENDPOINT"             = azurerm_cosmosdb_account.main.endpoint
      "AZURE_COSMOS_DB_KEY"                  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.cosmos_key.id})"
      "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
      "AZURE_STORAGE_ACCOUNT_NAME"           = azurerm_storage_account.main.name
      "WEBSITE_RUN_FROM_PACKAGE"             = "1"
    }
  }

  tags = local.common_tags
}

# Key Vault Secrets
resource "azurerm_key_vault_secret" "cosmos_key" {
  name         = "cosmos-db-primary-key"
  value        = azurerm_cosmosdb_account.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.kv_secrets_user]
}

resource "azurerm_key_vault_secret" "cosmos_connection_string" {
  name         = "cosmos-db-connection-string"
  value        = azurerm_cosmosdb_account.main.connection_strings[0]
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.kv_secrets_user]
}

# Role assignments
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
}

resource "azurerm_role_assignment" "kv_admin" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Static Web App
resource "azurerm_static_site" "main" {
  name                = "${var.app_name}-web-${var.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = "Central US"  # Limited regions for Static Web Apps
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = local.common_tags
}