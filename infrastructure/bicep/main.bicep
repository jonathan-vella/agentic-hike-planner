targetScope = 'resourceGroup'

@description('The environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('The location for all resources')
param location string = resourceGroup().location

@description('The application name prefix')
param appName string = 'hike-planner'

@description('Enable free tier for Cosmos DB (only one per subscription)')
param enableCosmosDbFreeTier bool = false

@description('Cosmos DB throughput mode - Phase 1 focuses on intentionally inefficient provisioned mode for demo')
@allowed(['provisioned', 'serverless'])
param cosmosDbThroughputMode string = 'provisioned'

// Generate unique names based on environment
var resourceNames = {
  cosmosDbAccount: '${appName}-cosmos-${environment}-${uniqueString(resourceGroup().id)}'
  keyVault: '${appName}-kv-${environment}-${uniqueString(resourceGroup().id)}'
}

// Cosmos DB Module - Phase 1: Intentionally inefficient configuration for demo
module cosmosDb 'modules/cosmos-db.bicep' = {
  name: 'cosmosDb-deployment'
  params: {
    cosmosDbAccountName: resourceNames.cosmosDbAccount
    location: location
    environment: environment
    enableFreeTier: enableCosmosDbFreeTier
    throughputMode: cosmosDbThroughputMode
    // Intentionally inefficient: High fixed throughput for demo (as per demo.md)
    minThroughput: 1000  // 1,000 RU/s consistently provisioned (inefficient)
    maxThroughput: 4000
  }
}

// Key Vault for storing secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: resourceNames.keyVault
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: environment == 'prod' ? 90 : 7
    enablePurgeProtection: environment == 'prod'
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
  tags: {
    Environment: environment
    Application: 'HikePlanner'
    CostCenter: 'Demo'
  }
}

// Store Cosmos DB primary key in Key Vault
resource cosmosDbPrimaryKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'cosmos-db-primary-key'
  properties: {
    value: cosmosDb.outputs.cosmosDbPrimaryKey
    contentType: 'text/plain'
  }
}

// Store Cosmos DB endpoint in Key Vault
resource cosmosDbEndpointSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'cosmos-db-endpoint'
  properties: {
    value: cosmosDb.outputs.cosmosDbEndpoint
    contentType: 'text/plain'
  }
}

// Outputs for easy reference - Phase 1 scope
output resourceNames object = resourceNames
output cosmosDbEndpoint string = cosmosDb.outputs.cosmosDbEndpoint
output cosmosDbAccountName string = cosmosDb.outputs.cosmosDbAccountName
output cosmosDbDatabaseName string = cosmosDb.outputs.databaseName
output cosmosDbPrimaryKey string = cosmosDb.outputs.cosmosDbPrimaryKey
output cosmosDbConnectionString string = cosmosDb.outputs.cosmosDbConnectionString
output keyVaultName string = keyVault.name