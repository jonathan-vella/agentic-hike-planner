@description('The name of the Cosmos DB account')
param cosmosDbAccountName string

@description('The location for the Cosmos DB account')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
param environment string

@description('Enable free tier (only one per subscription)')
param enableFreeTier bool = false

@description('Throughput mode for Cosmos DB - Demo uses intentionally inefficient provisioned mode')
@allowed(['provisioned', 'serverless'])
param throughputMode string = 'provisioned'

@description('Minimum throughput for provisioned mode - Intentionally high for demo (1,000 RU/s as per demo.md)')
param minThroughput int = 1000

@description('Maximum throughput for autoscale - Intentionally high for demo')
param maxThroughput int = 4000

var cosmosDbSettings = {
  dev: {
    consistencyLevel: 'Session'
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
  }
  staging: {
    consistencyLevel: 'Session'
    enableAutomaticFailover: true
    enableMultipleWriteLocations: false
  }
  prod: {
    consistencyLevel: 'BoundedStaleness'
    enableAutomaticFailover: true
    enableMultipleWriteLocations: true
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosDbAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    enableFreeTier: enableFreeTier
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: cosmosDbSettings[environment].consistencyLevel
    }
    enableAutomaticFailover: cosmosDbSettings[environment].enableAutomaticFailover
    enableMultipleWriteLocations: cosmosDbSettings[environment].enableMultipleWriteLocations
    enableAnalyticalStorage: false
    networkAclBypass: 'AzureServices'
    publicNetworkAccess: 'Enabled'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environment == 'prod'
      }
    ]
  }
  tags: {
    Environment: environment
    Application: 'HikePlanner'
    CostCenter: 'Demo'
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosDbAccount
  name: 'HikePlannerDB'
  properties: throughputMode == 'serverless' ? {
    resource: {
      id: 'HikePlannerDB'
    }
  } : {
    resource: {
      id: 'HikePlannerDB'
    }
    options: {
      autoscaleSettings: {
        maxThroughput: maxThroughput
      }
    }
  }
}

// Container definitions (excluding recommendations which is created separately)
var containers = [
  {
    name: 'users'
    partitionKey: '/partitionKey'
  }
  {
    name: 'trips'
    partitionKey: '/partitionKey'
  }
  {
    name: 'trails'
    partitionKey: '/partitionKey'
  }
]

resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = [for container in containers: {
  parent: database
  name: container.name
  properties: throughputMode == 'serverless' ? {
    resource: {
      id: container.name
      partitionKey: {
        paths: [container.partitionKey]
        kind: 'Hash'
      }
    }
  } : {
    resource: {
      id: container.name
      partitionKey: {
        paths: [container.partitionKey]
        kind: 'Hash'
      }
    }
    options: {
      throughput: minThroughput
    }
  }
}]

// Special container for recommendations with TTL
resource recommendationsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'recommendations'
  properties: {
    resource: {
      id: 'recommendations'
      partitionKey: {
        paths: ['/partitionKey']
        kind: 'Hash'
      }
      defaultTtl: 2592000  // 30 days
    }
    options: throughputMode == 'serverless' ? {} : {
      throughput: minThroughput
    }
  }
}

// Outputs
@description('The name of the Cosmos DB account')
output cosmosDbAccountName string = cosmosDbAccount.name

@description('The endpoint of the Cosmos DB account')
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint

@description('The primary key of the Cosmos DB account')
@secure()
output cosmosDbPrimaryKey string = cosmosDbAccount.listKeys().primaryMasterKey

@description('The connection string of the Cosmos DB account')
@secure()
output cosmosDbConnectionString string = cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString

@description('The resource ID of the Cosmos DB account')
output cosmosDbResourceId string = cosmosDbAccount.id

@description('The database name')
output databaseName string = database.name
