@description('The name of the Cosmos DB account')
param cosmosDbAccountName string

@description('The location for the Cosmos DB account')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
param environment string

@description('Enable free tier (only one per subscription)')
param enableFreeTier bool = false

@description('Throughput mode for Cosmos DB (provisioned or serverless)')
@allowed(['provisioned', 'serverless'])
param throughputMode string = 'serverless'

@description('Minimum throughput for provisioned mode')
param minThroughput int = 400

@description('Maximum throughput for autoscale')
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
      maxStalenessPrefix: cosmosDbSettings[environment].consistencyLevel == 'BoundedStaleness' ? 10 : null
      maxIntervalInSeconds: cosmosDbSettings[environment].consistencyLevel == 'BoundedStaleness' ? 5 : null
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environment == 'prod'
      }
    ]
    capabilities: throughputMode == 'serverless' ? [
      {
        name: 'EnableServerless'
      }
    ] : []
    enableAutomaticFailover: cosmosDbSettings[environment].enableAutomaticFailover
    enableMultipleWriteLocations: cosmosDbSettings[environment].enableMultipleWriteLocations
    enableAnalyticalStorage: false
    analyticalStorageConfiguration: {
      schemaType: 'WellDefined'
    }
    backup: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: environment == 'prod' ? 240 : 1440
        backupRetentionIntervalInHours: environment == 'prod' ? 720 : 168
        backupStorageRedundancy: environment == 'prod' ? 'Geo' : 'Local'
      }
    }
    networkAclBypass: 'AzureServices'
    publicNetworkAccess: 'Enabled'
    ipRules: []
    isVirtualNetworkFilterEnabled: false
    virtualNetworkRules: []
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

// Container definitions
var containers = [
  {
    name: 'users'
    partitionKey: '/partitionKey'
    indexingPolicy: {
      includedPaths: [
        { path: '/email/?' }
        { path: '/fitnessLevel/?' }
        { path: '/location/region/?' }
        { path: '/createdAt/?' }
      ]
      excludedPaths: [
        { path: '/*' }
      ]
    }
  }
  {
    name: 'trips'
    partitionKey: '/partitionKey'
    indexingPolicy: {
      includedPaths: [
        { path: '/userId/?' }
        { path: '/status/?' }
        { path: '/dates/startDate/?' }
        { path: '/dates/endDate/?' }
        { path: '/location/region/?' }
        { path: '/createdAt/?' }
      ]
      excludedPaths: [
        { path: '/*' }
      ]
    }
  }
  {
    name: 'trails'
    partitionKey: '/partitionKey'
    indexingPolicy: {
      includedPaths: [
        { path: '/characteristics/difficulty/?' }
        { path: '/characteristics/distance/?' }
        { path: '/characteristics/duration/?' }
        { path: '/location/region/?' }
        { path: '/location/country/?' }
        { path: '/ratings/average/?' }
        { path: '/isActive/?' }
      ]
      excludedPaths: [
        { path: '/*' }
      ]
    }
  }
  {
    name: 'recommendations'
    partitionKey: '/partitionKey'
    defaultTtl: 2592000  // 30 days
    indexingPolicy: {
      includedPaths: [
        { path: '/userId/?' }
        { path: '/tripId/?' }
        { path: '/confidence/?' }
        { path: '/createdAt/?' }
        { path: '/expiresAt/?' }
      ]
      excludedPaths: [
        { path: '/*' }
      ]
    }
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
      indexingPolicy: container.indexingPolicy
      defaultTtl: contains(container, 'defaultTtl') ? container.defaultTtl : null
    }
  } : {
    resource: {
      id: container.name
      partitionKey: {
        paths: [container.partitionKey]
        kind: 'Hash'
      }
      indexingPolicy: container.indexingPolicy
      defaultTtl: contains(container, 'defaultTtl') ? container.defaultTtl : null
    }
    options: {
      throughput: minThroughput
    }
  }
}]

// Outputs
@description('The name of the Cosmos DB account')
output cosmosDbAccountName string = cosmosDbAccount.name

@description('The endpoint of the Cosmos DB account')
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint

@description('The primary key of the Cosmos DB account')
output cosmosDbPrimaryKey string = cosmosDbAccount.listKeys().primaryMasterKey

@description('The connection string of the Cosmos DB account')
output cosmosDbConnectionString string = cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString

@description('The resource ID of the Cosmos DB account')
output cosmosDbResourceId string = cosmosDbAccount.id

@description('The database name')
output databaseName string = database.name