@description('The name of the App Service Plan')
param appServicePlanName string

@description('The location for the App Service Plan')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
param environment string

@description('The SKU name - Intentionally over-provisioned Standard S3 for cost demo')
param skuName string = 'S3'

@description('The SKU capacity')
param skuCapacity int = 1

// Intentionally over-provisioned App Service Plan for cost optimization demo
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: skuName
    capacity: skuCapacity
  }
  kind: 'app'
  properties: {
    reserved: false  // Windows plan
  }
  tags: {
    Environment: environment
    Application: 'HikePlanner'
    CostCenter: 'Demo'
    CostOptimization: 'OverProvisioned'
    OptimalSku: 'B2'  // Tracking what it should be for cost optimization
    WastageReason: 'Standard-S3-vs-Basic-B2'
  }
}

@description('The resource ID of the App Service Plan')
output appServicePlanId string = appServicePlan.id

@description('The name of the App Service Plan')
output appServicePlanName string = appServicePlan.name

@description('The SKU of the App Service Plan')
output appServicePlanSku object = appServicePlan.sku