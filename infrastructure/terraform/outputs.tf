output "resource_names" {
  description = "Names of all created resources"
  value = {
    cosmos_db_account         = azurerm_cosmosdb_account.main.name
    cosmos_db_database        = azurerm_cosmosdb_sql_database.main.name
    key_vault                = azurerm_key_vault.main.name
    app_service               = azurerm_linux_web_app.main.name
    app_service_plan          = azurerm_service_plan.main.name
    static_web_app           = azurerm_static_site.main.name
    storage_account          = azurerm_storage_account.main.name
    application_insights     = azurerm_application_insights.main.name
    log_analytics_workspace = azurerm_log_analytics_workspace.main.name
  }
}

output "cosmos_db_endpoint" {
  description = "The endpoint of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "cosmos_db_account_name" {
  description = "The name of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.main.name
}

output "cosmos_db_database_name" {
  description = "The name of the Cosmos DB database"
  value       = azurerm_cosmosdb_sql_database.main.name
}

output "cosmos_db_primary_key" {
  description = "The primary key of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.main.primary_key
  sensitive   = true
}

output "cosmos_db_connection_string" {
  description = "The connection string of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.main.connection_strings[0]
  sensitive   = true
}

output "key_vault_name" {
  description = "The name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "The URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "app_service_name" {
  description = "The name of the App Service"
  value       = azurerm_linux_web_app.main.name
}

output "app_service_hostname" {
  description = "The hostname of the App Service"
  value       = azurerm_linux_web_app.main.default_hostname
}

output "app_service_url" {
  description = "The URL of the App Service"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "static_web_app_name" {
  description = "The name of the Static Web App"
  value       = azurerm_static_site.main.name
}

output "static_web_app_url" {
  description = "The URL of the Static Web App"
  value       = "https://${azurerm_static_site.main.default_host_name}"
}

output "storage_account_name" {
  description = "The name of the Storage Account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_endpoint" {
  description = "The primary blob endpoint of the Storage Account"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

output "application_insights_instrumentation_key" {
  description = "The instrumentation key of Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "The connection string of Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "The ID of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.id
}

output "containers" {
  description = "Names of created Cosmos DB containers"
  value       = [for container in azurerm_cosmosdb_sql_container.main : container.name]
}

output "environment_variables" {
  description = "Environment variables for application configuration"
  value = {
    NODE_ENV                               = var.environment == "prod" ? "production" : "development"
    AZURE_COSMOS_DB_ENDPOINT               = azurerm_cosmosdb_account.main.endpoint
    AZURE_COSMOS_DB_KEY                    = "Retrieved from Key Vault"
    APPLICATIONINSIGHTS_CONNECTION_STRING  = "Retrieved from Key Vault"
    AZURE_STORAGE_ACCOUNT_NAME             = azurerm_storage_account.main.name
  }
  sensitive = false
}

output "deployment_summary" {
  description = "Summary of the deployment"
  value = {
    environment          = var.environment
    location            = var.location
    cosmos_db_mode      = var.cosmos_db_throughput_mode
    free_tier_enabled   = var.enable_cosmos_db_free_tier
    resource_count      = 10
    estimated_monthly_cost = var.environment == "dev" ? "$25-35" : var.environment == "staging" ? "$40-60" : "$80-120"
  }
}