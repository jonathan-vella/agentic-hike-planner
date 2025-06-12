@description('The name of the budget')
param budgetName string

@description('The environment (dev, staging, prod)')
param environment string

@description('The email address for budget alerts')
param alertEmail string = 'demo@example.com'

@description('Budget amount in USD')
param budgetAmount int = environment == 'prod' ? 100 : (environment == 'staging' ? 50 : 25)

// Budget for cost monitoring and alerts - scoped to current resource group
resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: budgetName
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '2025-06-01'
      endDate: '2026-12-31'
    }
    filter: {
      dimensions: {
        name: 'ResourceGroupName'
        operator: 'In'
        values: [
          resourceGroup().name
        ]
      }
    }
    notifications: {
      // 50% threshold - Monitor
      notification50: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        contactEmails: [
          alertEmail
        ]
        contactRoles: [
          'Owner'
          'Contributor'
        ]
      }
      // 80% threshold - Investigate  
      notification80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: [
          alertEmail
        ]
        contactRoles: [
          'Owner'
          'Contributor'
        ]
      }
      // 100% threshold - Emergency
      notification100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: [
          alertEmail
        ]
        contactRoles: [
          'Owner'
          'Contributor'
        ]
      }
    }
  }
}

// Action Group for more advanced alerting
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${budgetName}-alerts'
  location: 'Global'
  properties: {
    groupShortName: 'CostAlert'
    enabled: true
    emailReceivers: [
      {
        name: 'CostAlertEmail'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
  tags: {
    Environment: environment
    Application: 'HikePlanner'
    CostCenter: 'Demo'
    AlertType: 'CostManagement'
  }
}

@description('The resource ID of the budget')
output budgetId string = budget.id

@description('The name of the budget')
output budgetName string = budget.name

@description('The resource ID of the action group')
output actionGroupId string = actionGroup.id

@description('Budget configuration summary')
output budgetSummary object = {
  budgetAmount: budgetAmount
  environment: environment
  thresholds: [50, 80, 100]
  alertEmail: alertEmail
}
