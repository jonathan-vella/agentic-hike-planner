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
    Application = "HikePlanner"
    CostCenter  = "Demo"
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
    }
    staging = {
      consistency_level              = "Session"
      enable_automatic_failover      = true
      enable_multiple_write_locations = false
      backup_interval_minutes        = 1440
      backup_retention_hours         = 168
      backup_storage_redundancy      = "Local"
      is_zone_redundant             = false
    }
    prod = {
      consistency_level              = "BoundedStaleness"
      enable_automatic_failover      = true
      enable_multiple_write_locations = true
      backup_interval_minutes        = 240
      backup_retention_hours         = 720
      backup_storage_redundancy      = "Geo"
      is_zone_redundant             = true
    }
  }
}

# Cosmos DB Account - Phase 1: Intentionally inefficient configuration for demo
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.app_name}-cosmos-${var.environment}-${local.resource_suffix}"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  # Intentionally inefficient: Always use provisioned throughput for demo
  enable_free_tier         = var.enable_cosmos_db_free_tier
  enable_automatic_failover = local.env_settings[var.environment].enable_automatic_failover
  enable_multiple_write_locations = local.env_settings[var.environment].enable_multiple_write_locations

  # Cosmos DB does not support capabilities for provisioned mode
  dynamic "capabilities" {
    for_each = var.cosmos_db_throughput_mode == "serverless" ? [1] : []
    content {
      name = "EnableServerless"
    }
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

# Cosmos DB SQL Database - Intentionally inefficient: Fixed high throughput
resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "HikePlannerDB"
  resource_group_name = data.azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name

  # Intentionally inefficient: Use fixed high throughput instead of autoscale
  throughput = var.cosmos_db_throughput_mode == "provisioned" ? var.cosmos_db_min_throughput : null
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

# Cosmos DB Containers - Intentionally inefficient: Fixed throughput per container
resource "azurerm_cosmosdb_sql_container" "containers" {
  for_each = { for container in local.containers : container.name => container }

  name                = each.value.name
  resource_group_name = data.azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_path  = each.value.partition_key
  default_ttl         = each.value.default_ttl

  # Intentionally inefficient: Fixed throughput for each container
  throughput = var.cosmos_db_throughput_mode == "provisioned" ? var.cosmos_db_min_throughput : null

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
}

# Key Vault for secrets storage
resource "azurerm_key_vault" "main" {
  name                        = "${var.app_name}-kv-${var.environment}-${local.resource_suffix}"
  location                    = var.location
  resource_group_name         = data.azurerm_resource_group.main.name
  enabled_for_disk_encryption = false
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = var.environment == "prod" ? 90 : 7
  purge_protection_enabled    = var.environment == "prod"
  enable_rbac_authorization   = true

  sku_name = "standard"

  tags = local.common_tags
}

# Store Cosmos DB primary key in Key Vault
resource "azurerm_key_vault_secret" "cosmos_primary_key" {
  name         = "cosmos-db-primary-key"
  value        = azurerm_cosmosdb_account.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store Cosmos DB endpoint in Key Vault
resource "azurerm_key_vault_secret" "cosmos_endpoint" {
  name         = "cosmos-db-endpoint"
  value        = azurerm_cosmosdb_account.main.endpoint
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}