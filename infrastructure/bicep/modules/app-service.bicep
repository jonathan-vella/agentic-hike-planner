@description('The name of the App Service')
param appServiceName string

@description('The location for the App Service')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
param environment string

@description('The resource ID of the App Service Plan')
param appServicePlanId string

@description('The Key Vault name for storing secrets')
param keyVaultName string

@description('The Cosmos DB endpoint')
param cosmosDbEndpoint string

@description('The name of the Cosmos DB database')
param cosmosDbDatabaseName string

// App Service for Node.js backend
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  kind: 'app'
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
    redundancyMode: 'None'
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      nodeVersion: '~18'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'NODE_ENV'
          value: environment == 'prod' ? 'production' : 'development'
        }
        {
          name: 'AZURE_COSMOS_DB_ENDPOINT'
          value: cosmosDbEndpoint
        }
        {
          name: 'AZURE_COSMOS_DB_DATABASE'
          value: cosmosDbDatabaseName
        }
        {
          name: 'AZURE_COSMOS_DB_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/cosmos-db-primary-key/)'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
    clientAffinityEnabled: false
  }
  tags: {
    Environment: environment
    Application: 'HikePlanner'
    CostCenter: 'Demo'
    ServiceTier: 'Backend'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Grant App Service access to Key Vault
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  name: '${keyVaultName}/add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: appService.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

@description('The name of the App Service')
output appServiceName string = appService.name

@description('The default hostname of the App Service')
output appServiceDefaultHostname string = appService.properties.defaultHostName

@description('The principal ID of the App Service managed identity')
output appServicePrincipalId string = appService.identity.principalId

@description('The resource ID of the App Service')
output appServiceId string = appService.id
