# Phase 1 Deployment Guide: Azure Cosmos DB & IaC Foundation

This guide covers **Phase 1** of the Azure Cost Optimization Demo Infrastructure implementation. Phase 1 focuses specifically on Azure Cosmos DB integration and Infrastructure as Code foundation, as defined in [Issue #21](https://github.com/danielmeppiel/agentic-hike-planner/issues/21).

## 🎯 Phase 1 Scope & Objectives

**Phase 1** is intentionally limited in scope to establish the foundational database infrastructure with intentionally inefficient configuration for cost optimization demonstration.

### ✅ What's Included in Phase 1
- **Azure Cosmos DB** with intentionally inefficient provisioned throughput (1,000 RU/s)
- **Azure Key Vault** for secure secret storage  
- **Infrastructure as Code** templates (Bicep & Terraform)
- **Deployment automation** scripts
- **Integration testing** framework for Azure resources
- **Performance benchmarking** utilities

### ❌ What's NOT in Phase 1
- App Service Plans and App Services (Phase 2+)
- Application Gateway (Phase 3+) 
- Multiple Storage Accounts (Phase 4+)
- Azure Functions Premium Plans (Phase 5+)
- Static Web Apps (Phase 6+)
- CDN and Redis Cache (Phase 7+)

> **Important**: This follows the phased approach defined in [demo.md](docs/demo.md) and [architecture-inefficient.md](docs/architecture-inefficient.md). Each subsequent phase will add specific inefficient infrastructure components.

## 🏗️ Phase 1 Architecture

The Phase 1 infrastructure includes:

- **Azure Cosmos DB** (Provisioned 1,000 RU/s) - Intentionally inefficient configuration for cost optimization demo
- **Azure Key Vault** - Secure storage for Cosmos DB secrets and connection strings

### Intentionally Inefficient Configuration

As per [demo.md](docs/demo.md), Phase 1 implements the following inefficiencies for cost optimization demonstration:

| Resource | Configuration | Inefficiency | Monthly Cost Impact |
|----------|---------------|--------------|-------------------|
| **Cosmos DB** | 1,000 RU/s provisioned | Should use serverless for this workload | ~$60/month |
| **Key Vault** | Standard tier | Basic operations for demo purposes | ~$5/month |
| **Total** | | | **~$65/month** |

**Optimization Potential**: 80% cost reduction by switching to Cosmos DB serverless mode (~$13/month)

## 🔧 Prerequisites

### Required Tools

1. **Azure CLI** (version 2.50.0 or later)
   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   
   # Verify installation
   az --version
   ```

2. **Azure Subscription**
   - Active Azure subscription with sufficient permissions
   - Contributor or Owner role on the subscription or resource group

3. **For Terraform deployment (optional)**
   ```bash
   # Install Terraform
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com apt main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   
   # Verify installation
   terraform --version
   ```

### Azure Authentication

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Verify current subscription
az account show
```

## 🚀 Deployment Options

### Option 1: Bicep Deployment (Recommended)

#### 1. Validate Templates

```bash
# Validate all templates
./scripts/validate.sh --environment dev --type bicep

# Validate with specific resource group
./scripts/validate.sh --environment dev --resource-group rg-hike-planner-dev --type bicep
```

#### 2. Deploy Infrastructure

```bash
# Create resource group and deploy (development environment)
./scripts/deploy.sh \
  --environment dev \
  --resource-group rg-hike-planner-dev \
  --location eastus \
  --free-tier

# Deploy to staging
./scripts/deploy.sh \
  --environment staging \
  --resource-group rg-hike-planner-staging \
  --location eastus

# Deploy to production
./scripts/deploy.sh \
  --environment prod \
  --resource-group rg-hike-planner-prod \
  --location eastus
```

#### 3. Verify Deployment

```bash
# Check deployment status
az deployment group list --resource-group rg-hike-planner-dev

# Get deployment outputs
az deployment group show \
  --resource-group rg-hike-planner-dev \
  --name hike-planner-dev-YYYYMMDD-HHMMSS \
  --query properties.outputs
```

### Option 2: Terraform Deployment

#### 1. Validate Configuration

```bash
# Validate Terraform templates
./scripts/validate.sh --environment dev --type terraform
```

#### 2. Deploy Infrastructure

```bash
# Deploy using Terraform
./scripts/deploy.sh \
  --environment dev \
  --resource-group rg-hike-planner-dev \
  --method terraform \
  --location eastus
```

#### 3. View Terraform State

```bash
cd infrastructure/terraform
terraform output
```

## 🔧 Configuration

### Environment Variables

After deployment, update your application with the following environment variables:

```bash
# Get Cosmos DB endpoint
COSMOS_ENDPOINT=$(az cosmosdb show --name <cosmos-account-name> --resource-group <resource-group> --query documentEndpoint -o tsv)

# Get Key Vault URI
KEYVAULT_URI=$(az keyvault show --name <keyvault-name> --resource-group <resource-group> --query properties.vaultUri -o tsv)

# Get Storage Account name
STORAGE_NAME=$(az storage account list --resource-group <resource-group> --query '[0].name' -o tsv)
```

### Application Settings

The deployment automatically configures the following for your App Service:

```json
{
  "NODE_ENV": "production",
  "AZURE_COSMOS_DB_ENDPOINT": "<cosmos-endpoint>",
  "AZURE_COSMOS_DB_KEY": "@Microsoft.KeyVault(SecretUri=<keyvault-secret-uri>)",
  "APPLICATIONINSIGHTS_CONNECTION_STRING": "<insights-connection-string>",
  "AZURE_STORAGE_ACCOUNT_NAME": "<storage-account-name>"
}
```

## 📊 Cost Management

### Environment Costs (Estimated Monthly)

| Environment | Cosmos DB | App Service | Storage | Monitoring | Total |
|-------------|-----------|-------------|---------|------------|-------|
| **Development** | $0 (Free Tier) | $13 (B1) | $5 | $5 | **~$25** |
| **Staging** | $25 (Serverless) | $13 (B1) | $5 | $5 | **~$50** |
| **Production** | $40 (Provisioned) | $55 (B2) | $15 | $10 | **~$120** |

### Cost Optimization Tips

1. **Use Free Tiers**: Enable Cosmos DB free tier for development
2. **Serverless Mode**: Use serverless Cosmos DB for variable workloads
3. **Autoscale**: Enable autoscale for App Service Plans in production
4. **Storage Lifecycle**: Configure blob storage lifecycle policies
5. **Monitoring**: Set up budget alerts and cost monitoring

## 🧪 Testing the Deployment

### 1. Health Check

```bash
# Get App Service URL
APP_URL=$(az webapp show --name <app-service-name> --resource-group <resource-group> --query defaultHostName -o tsv)

# Test health endpoint
curl https://$APP_URL/health
```

### 2. Database Connectivity

```bash
# Run integration tests
cd tests/integration/azure
npm test -- --testPathPattern=cosmos-db.test.ts
```

### 3. Performance Benchmarks

```bash
# Run performance tests
cd tests/performance
npx ts-node cosmos-db-benchmark.ts
```

## 🔐 Security Configuration

### 1. Key Vault Access

```bash
# Grant additional users access to Key Vault
az keyvault set-policy \
  --name <keyvault-name> \
  --upn user@domain.com \
  --secret-permissions get list
```

### 2. Cosmos DB Security

```bash
# Enable IP firewall (production)
az cosmosdb update \
  --name <cosmos-account-name> \
  --resource-group <resource-group> \
  --ip-range-filter "0.0.0.0/0"  # Replace with your IP ranges
```

### 3. App Service Security

```bash
# Configure custom domain and SSL
az webapp config hostname add \
  --webapp-name <app-service-name> \
  --resource-group <resource-group> \
  --hostname your-domain.com
```

## 🔄 CI/CD Integration

### GitHub Actions Setup

1. **Service Principal Creation**
   ```bash
   az ad sp create-for-rbac --name "hike-planner-deploy" \
     --role contributor \
     --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group> \
     --sdk-auth
   ```

2. **GitHub Secrets**
   Add the following secrets to your GitHub repository:
   - `AZURE_CREDENTIALS` - Service principal JSON
   - `AZURE_SUBSCRIPTION_ID` - Your subscription ID
   - `AZURE_RESOURCE_GROUP` - Target resource group

3. **Workflow Example**
   ```yaml
   name: Deploy to Azure
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3
       - uses: azure/login@v1
         with:
           creds: ${{ secrets.AZURE_CREDENTIALS }}
       - name: Deploy Infrastructure
         run: |
           ./scripts/deploy.sh \
             --environment prod \
             --resource-group ${{ secrets.AZURE_RESOURCE_GROUP }}
   ```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Cosmos DB Free Tier Limit
**Error**: `Free tier account already exists`
**Solution**: Only one free tier Cosmos DB per subscription. Use `--free-tier false` for additional deployments.

#### 2. Resource Name Conflicts
**Error**: `Storage account name not available`
**Solution**: Resource names are globally unique. The deployment script adds random suffixes to avoid conflicts.

#### 3. Key Vault Access Denied
**Error**: `Access denied to Key Vault`
**Solution**: Ensure proper permissions and wait for RBAC propagation (up to 10 minutes).

#### 4. App Service Startup Issues
**Error**: `Application failed to start`
**Solution**: Check Application Insights logs and ensure environment variables are correctly configured.

### Diagnostic Commands

```bash
# Check resource group resources
az resource list --resource-group <resource-group> --output table

# Check Cosmos DB status
az cosmosdb show --name <cosmos-account> --resource-group <resource-group>

# Check App Service logs
az webapp log tail --name <app-service> --resource-group <resource-group>

# Check Key Vault access policies
az keyvault show --name <keyvault> --resource-group <resource-group> --query properties.accessPolicies
```

### Cleanup and Teardown

```bash
# Remove all resources
./scripts/teardown.sh \
  --environment dev \
  --resource-group rg-hike-planner-dev

# Force removal without confirmation
./scripts/teardown.sh \
  --environment dev \
  --resource-group rg-hike-planner-dev \
  --force
```

## 📞 Support

### Getting Help

1. **Azure Documentation**: [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
2. **GitHub Issues**: Create an issue in the repository for application-specific problems
3. **Azure Support**: Use Azure Support portal for infrastructure issues

### Monitoring and Alerts

1. **Application Insights Dashboard**: Monitor application performance
2. **Azure Monitor**: Set up custom alerts for resource usage
3. **Cost Management**: Monitor spending and set budget alerts

## 📚 Additional Resources

- [Azure Cosmos DB Best Practices](https://docs.microsoft.com/azure/cosmos-db/best-practices)
- [App Service Deployment Best Practices](https://docs.microsoft.com/azure/app-service/deploy-best-practices)
- [Azure Key Vault Security](https://docs.microsoft.com/azure/key-vault/general/security-overview)
- [Infrastructure as Code with Bicep](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)

---

**Last Updated**: Phase 1 Implementation  
**Version**: 1.0.0  
**Maintained by**: Hike Planner Development Team