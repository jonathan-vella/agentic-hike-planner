# Phase 1 Outputs: Cosmos DB and Key Vault only

output "resource_names" {
  description = "Names of Phase 1 resources"
  value = {
    cosmos_db_account  = azurerm_cosmosdb_account.main.name
    cosmos_db_database = azurerm_cosmosdb_sql_database.main.name
    key_vault         = azurerm_key_vault.main.name
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

output "containers" {
  description = "Names of created Cosmos DB containers"
  value       = [for name, container in azurerm_cosmosdb_sql_container.containers : container.name]
}

output "environment_variables" {
  description = "Environment variables for application configuration (Phase 1)"
  value = {
    NODE_ENV                     = var.environment == "prod" ? "production" : "development"
    AZURE_COSMOS_DB_ENDPOINT     = azurerm_cosmosdb_account.main.endpoint
    AZURE_COSMOS_DB_KEY          = "Retrieved from Key Vault"
    AZURE_COSMOS_DB_DATABASE     = azurerm_cosmosdb_sql_database.main.name
  }
  sensitive = false
}

output "deployment_summary" {
  description = "Summary of the Phase 1 deployment"
  value = {
    phase                    = "1 - Cosmos DB Integration"
    environment             = var.environment
    location                = var.location
    cosmos_db_mode          = var.cosmos_db_throughput_mode
    cosmos_min_throughput   = var.cosmos_db_min_throughput
    free_tier_enabled       = var.enable_cosmos_db_free_tier
    resource_count          = 2
    intentionally_inefficient = var.cosmos_db_throughput_mode == "provisioned" && var.cosmos_db_min_throughput >= 1000
    estimated_monthly_cost  = "$60-80 (intentionally high for demo)"
    optimization_potential  = "Switch to serverless mode for 80% cost reduction"
    next_phase             = "Phase 2: App Service and monitoring infrastructure"
  }
}