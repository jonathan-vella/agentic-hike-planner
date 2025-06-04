#!/bin/bash

# Phase 1 Deployment Script: Azure Cosmos DB and Key Vault
# This script deploys only the Phase 1 infrastructure components as defined in issue #21
# Implements intentionally inefficient configuration for cost optimization demo

set -euo pipefail

# Script constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly BICEP_DIR="$PROJECT_ROOT/infrastructure/bicep"
readonly TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform"

# Default values
ENVIRONMENT="${1:-dev}"
RESOURCE_GROUP="${2:-hike-planner-rg-$ENVIRONMENT}"
LOCATION="${3:-eastus}"
DEPLOYMENT_TYPE="${4:-bicep}"
DRY_RUN="${5:-false}"
SUBSCRIPTION=""

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Usage: $0 [ENVIRONMENT] [RESOURCE_GROUP] [LOCATION] [DEPLOYMENT_TYPE] [DRY_RUN]

Phase 1 Deployment Script - Azure Cosmos DB and Key Vault only

Arguments:
    ENVIRONMENT      Environment name (dev, staging, prod) [default: dev]
    RESOURCE_GROUP   Resource group name [default: hike-planner-rg-ENVIRONMENT]
    LOCATION         Azure region [default: eastus]
    DEPLOYMENT_TYPE  Deployment type (bicep or terraform) [default: bicep]
    DRY_RUN         Perform validation only (true/false) [default: false]

Examples:
    # Deploy to development with defaults
    $0

    # Deploy to staging environment
    $0 staging hike-planner-rg-staging eastus bicep false

    # Validate production deployment (dry run)
    $0 prod hike-planner-rg-prod eastus bicep true

    # Deploy using Terraform
    $0 dev hike-planner-rg-dev eastus terraform false

Phase 1 Scope:
    - Azure Cosmos DB (intentionally inefficient 1,000 RU/s provisioned)
    - Azure Key Vault for secrets storage
    - Cost: ~\$60-80/month (intentionally high for cost optimization demo)

EOF
}

validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
        exit 1
    fi
}

validate_deployment_type() {
    if [[ ! "$DEPLOYMENT_TYPE" =~ ^(bicep|terraform)$ ]]; then
        log_error "Invalid deployment type: $DEPLOYMENT_TYPE. Must be bicep or terraform."
        exit 1
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites for Phase 1 deployment..."

    # Check if Azure CLI is installed and authenticated
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi

    # Check Azure CLI authentication
    if ! az account show &> /dev/null; then
        log_error "Not authenticated with Azure CLI. Please run 'az login' first."
        exit 1
    fi

    # Get current subscription
    SUBSCRIPTION=$(az account show --query "id" -o tsv)
    log_info "Using Azure subscription: $SUBSCRIPTION"

    # Check deployment type specific prerequisites
    if [[ "$DEPLOYMENT_TYPE" == "bicep" ]]; then
        if ! az bicep version &> /dev/null; then
            log_error "Bicep CLI is not installed. Please install it first."
            exit 1
        fi
        log_success "Bicep CLI is available"
    elif [[ "$DEPLOYMENT_TYPE" == "terraform" ]]; then
        if ! command -v terraform &> /dev/null; then
            log_error "Terraform is not installed. Please install it first."
            exit 1
        fi
        log_success "Terraform is available"
    fi
}

create_resource_group() {
    log_info "Creating resource group: $RESOURCE_GROUP"
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_warning "Resource group $RESOURCE_GROUP already exists"
    else
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags \
                Environment="$ENVIRONMENT" \
                Application="HikePlanner" \
                CostCenter="Demo" \
                Phase="1" \
                Purpose="Cost Optimization Demo" \
                CreatedBy="deployment-script"
        log_success "Resource group created successfully"
    fi
}

deploy_bicep() {
    log_info "Starting Phase 1 Bicep deployment..."
    
    local main_template="$BICEP_DIR/main.bicep"
    local parameters_file="$BICEP_DIR/parameters/$ENVIRONMENT.json"
    
    if [[ ! -f "$main_template" ]]; then
        log_error "Bicep template not found: $main_template"
        exit 1
    fi
    
    if [[ ! -f "$parameters_file" ]]; then
        log_error "Parameters file not found: $parameters_file"
        exit 1
    fi
    
    # Build Bicep template to validate syntax
    log_info "Validating Bicep template..."
    az bicep build --file "$main_template"
    log_success "Bicep template validation passed"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Performing what-if analysis..."
        az deployment group what-if \
            --resource-group "$RESOURCE_GROUP" \
            --template-file "$main_template" \
            --parameters "@$parameters_file" \
            --parameters environment="$ENVIRONMENT"
        log_success "What-if analysis completed"
        return 0
    fi
    
    # Deploy the template
    log_info "Deploying Phase 1 infrastructure..."
    local deployment_name="phase1-deployment-$(date +%Y%m%d-%H%M%S)"
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$deployment_name" \
        --template-file "$main_template" \
        --parameters "@$parameters_file" \
        --parameters environment="$ENVIRONMENT" \
        --verbose
    
    log_success "Phase 1 Bicep deployment completed successfully"
}

deploy_terraform() {
    log_info "Starting Phase 1 Terraform deployment..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Planning Terraform deployment..."
    terraform plan \
        -var="environment=$ENVIRONMENT" \
        -var="app_name=hike-planner" \
        -out="phase1.tfplan"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_success "Terraform plan completed (dry run)"
        return 0
    fi
    
    # Apply deployment
    log_info "Applying Terraform deployment..."
    terraform apply "phase1.tfplan"
    
    log_success "Phase 1 Terraform deployment completed successfully"
    
    cd "$PROJECT_ROOT"
}

show_deployment_summary() {
    log_success "Phase 1 deployment completed!"
    
    cat << EOF

📊 Phase 1 Deployment Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment:           $ENVIRONMENT
Resource Group:        $RESOURCE_GROUP
Location:              $LOCATION
Deployment Type:       $DEPLOYMENT_TYPE

✅ Resources Created:
   • Azure Cosmos DB (intentionally inefficient - 1,000 RU/s provisioned)
   • Azure Key Vault (for secrets storage)

💰 Cost Information:
   • Estimated Monthly Cost: \$60-80 (intentionally high)
   • Optimization Potential: 80% reduction possible
   • Demo Purpose: Cost optimization demonstration

🎯 Phase 1 Objectives Met:
   ✅ Cosmos DB infrastructure deployed
   ✅ Intentionally inefficient configuration implemented
   ✅ Key Vault for secure secret storage
   ✅ Ready for cost optimization workflow demonstration

📋 Next Steps:
   1. Update application configuration with Cosmos DB connection details
   2. Test database connectivity and operations
   3. Run Phase 1 integration tests
   4. Proceed to Phase 2: App Service and monitoring infrastructure

🔗 Useful Commands:
   # Test Cosmos DB connectivity
   az cosmosdb database list --name <cosmos-account-name> --resource-group $RESOURCE_GROUP
   
   # View Key Vault secrets
   az keyvault secret list --vault-name <key-vault-name>
   
   # Monitor costs
   az consumption usage list --start-date $(date -d '30 days ago' +%Y-%m-%d) --end-date $(date +%Y-%m-%d)

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_usage
        exit 0
        ;;
esac

# Main execution
main() {
    log_info "Starting Phase 1 deployment script..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Resource Group: $RESOURCE_GROUP"
    log_info "Location: $LOCATION"
    log_info "Deployment Type: $DEPLOYMENT_TYPE"
    log_info "Dry Run: $DRY_RUN"
    
    validate_environment
    validate_deployment_type
    check_prerequisites
    
    if [[ "$DRY_RUN" != "true" ]]; then
        create_resource_group
    fi
    
    if [[ "$DEPLOYMENT_TYPE" == "bicep" ]]; then
        deploy_bicep
    elif [[ "$DEPLOYMENT_TYPE" == "terraform" ]]; then
        deploy_terraform
    fi
    
    if [[ "$DRY_RUN" != "true" ]]; then
        show_deployment_summary
    fi
    
    log_success "Phase 1 deployment script completed successfully!"
}

# Execute main function
main "$@"