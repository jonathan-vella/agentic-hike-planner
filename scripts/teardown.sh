#!/bin/bash

# Azure Hike Planner Teardown Script
# This script removes all Azure infrastructure created by the deployment script

set -euo pipefail

# Default values
ENVIRONMENT="dev"
APP_NAME="hike-planner"
RESOURCE_GROUP=""
SUBSCRIPTION_ID=""
DEPLOYMENT_METHOD="bicep"
FORCE=false
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Help function
show_help() {
    cat << EOF
Azure Hike Planner Teardown Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment    Environment name (dev/staging/prod) [default: dev]
    -a, --app-name       Application name prefix [default: hike-planner]
    -g, --resource-group Resource group name [required]
    -s, --subscription   Azure subscription ID [optional]
    -m, --method         Deployment method used (bicep/terraform) [default: bicep]
    -f, --force          Skip confirmation prompts [default: false]
    -d, --dry-run        Show what would be deleted without actually deleting [default: false]
    -h, --help           Show this help message

Examples:
    # Remove dev environment resources
    $0 --environment dev --resource-group rg-hike-planner-dev

    # Remove all resources without confirmation
    $0 --environment prod --resource-group rg-hike-planner-prod --force

    # Show what would be deleted
    $0 --environment dev --resource-group rg-hike-planner-dev --dry-run

    # Remove resources deployed with Terraform
    $0 --environment dev --resource-group rg-hike-planner-dev --method terraform

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -a|--app-name)
                APP_NAME="$2"
                shift 2
                ;;
            -g|--resource-group)
                RESOURCE_GROUP="$2"
                shift 2
                ;;
            -s|--subscription)
                SUBSCRIPTION_ID="$2"
                shift 2
                ;;
            -m|--method)
                DEPLOYMENT_METHOD="$2"
                shift 2
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Validate inputs
validate_inputs() {
    if [[ -z "$RESOURCE_GROUP" ]]; then
        log_error "Resource group name is required. Use -g or --resource-group"
        exit 1
    fi

    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        log_error "Environment must be one of: dev, staging, prod"
        exit 1
    fi

    if [[ ! "$DEPLOYMENT_METHOD" =~ ^(bicep|terraform)$ ]]; then
        log_error "Deployment method must be one of: bicep, terraform"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is required but not installed. Please install it first."
        exit 1
    fi

    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi

    # Check if Terraform is installed (if using Terraform)
    if [[ "$DEPLOYMENT_METHOD" == "terraform" ]]; then
        if ! command -v terraform &> /dev/null; then
            log_error "Terraform is required but not installed. Please install it first."
            exit 1
        fi
    fi

    log_success "Prerequisites check passed"
}

# Set Azure subscription
set_subscription() {
    if [[ -n "$SUBSCRIPTION_ID" ]]; then
        log_info "Setting Azure subscription to: $SUBSCRIPTION_ID"
        az account set --subscription "$SUBSCRIPTION_ID"
    fi
    
    local current_subscription=$(az account show --query name -o tsv)
    log_info "Using Azure subscription: $current_subscription"
}

# Check if resource group exists
check_resource_group() {
    if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_warning "Resource group '$RESOURCE_GROUP' does not exist"
        exit 0
    fi
}

# List resources in the resource group
list_resources() {
    log_info "Resources in resource group '$RESOURCE_GROUP':"
    
    local resources=$(az resource list --resource-group "$RESOURCE_GROUP" --query '[].{Name:name, Type:type, Location:location}' -o table)
    
    if [[ -z "$resources" || "$resources" == "[]" ]]; then
        log_info "No resources found in resource group"
        return 1
    fi
    
    echo "$resources"
    return 0
}

# Confirm deletion
confirm_deletion() {
    if [[ "$FORCE" == true ]]; then
        return 0
    fi
    
    log_warning ""
    log_warning "⚠️  WARNING: This will DELETE ALL RESOURCES in the resource group '$RESOURCE_GROUP'"
    log_warning "This action cannot be undone!"
    log_warning ""
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    
    if [[ ! $REPLY =~ ^(yes|YES|y|Y)$ ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
}

# Teardown using Bicep (delete resource group)
teardown_bicep() {
    log_info "Tearing down infrastructure deployed with Bicep..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would delete resource group '$RESOURCE_GROUP' and all contained resources"
        return 0
    fi
    
    log_info "Deleting resource group: $RESOURCE_GROUP"
    
    if az group delete --name "$RESOURCE_GROUP" --yes --no-wait; then
        log_success "Resource group deletion initiated"
        log_info "Note: Deletion is running in the background and may take several minutes"
        log_info "You can check the status with: az group show --name $RESOURCE_GROUP"
    else
        log_error "Failed to delete resource group"
        exit 1
    fi
}

# Teardown using Terraform
teardown_terraform() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local terraform_dir="$script_dir/../infrastructure/terraform"
    
    log_info "Tearing down infrastructure deployed with Terraform..."
    
    # Check if Terraform state exists
    if [[ ! -f "$terraform_dir/terraform.tfstate" ]] && [[ ! -f "$terraform_dir/.terraform/terraform.tfstate" ]]; then
        log_warning "No Terraform state found. Falling back to resource group deletion."
        teardown_bicep
        return
    fi
    
    # Change to Terraform directory
    cd "$terraform_dir"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Create Terraform variables file
    local vars_file="terraform.tfvars"
    cat > "$vars_file" << EOF
environment = "$ENVIRONMENT"
app_name = "$APP_NAME"
EOF
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Creating Terraform destroy plan..."
        terraform plan -destroy -var-file="$vars_file"
        log_info "DRY RUN: Would destroy all resources managed by Terraform"
    else
        log_info "Destroying Terraform-managed resources..."
        terraform destroy -var-file="$vars_file" -auto-approve
        
        if [[ $? -eq 0 ]]; then
            log_success "Terraform destroy completed successfully"
        else
            log_error "Terraform destroy failed"
            log_warning "You may need to manually clean up remaining resources"
            exit 1
        fi
    fi
    
    # Clean up
    rm -f "$vars_file"
}

# Special resources cleanup
cleanup_special_resources() {
    log_info "Checking for special resources that might need manual cleanup..."
    
    # Check for Key Vaults with soft delete
    local key_vaults=$(az keyvault list --resource-group "$RESOURCE_GROUP" --query '[].name' -o tsv 2>/dev/null || true)
    
    if [[ -n "$key_vaults" ]]; then
        log_warning "Found Key Vaults that may have soft delete enabled:"
        for kv in $key_vaults; do
            log_warning "  - $kv"
        done
        log_warning "If these Key Vaults have soft delete enabled, you may need to purge them manually:"
        log_warning "  az keyvault purge --name <vault-name>"
    fi
    
    # Check for Cosmos DB accounts
    local cosmos_accounts=$(az cosmosdb list --resource-group "$RESOURCE_GROUP" --query '[].name' -o tsv 2>/dev/null || true)
    
    if [[ -n "$cosmos_accounts" ]]; then
        log_warning "Found Cosmos DB accounts:"
        for account in $cosmos_accounts; do
            log_warning "  - $account"
        done
        log_warning "Cosmos DB deletions may take several minutes to complete"
    fi
}

# Monitor deletion progress
monitor_deletion() {
    if [[ "$DRY_RUN" == true ]]; then
        return 0
    fi
    
    log_info "Monitoring deletion progress..."
    
    local max_wait=600  # 10 minutes
    local wait_interval=30  # 30 seconds
    local elapsed=0
    
    while [[ $elapsed -lt $max_wait ]]; do
        if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
            log_success "Resource group deletion completed"
            return 0
        fi
        
        log_info "Deletion in progress... (${elapsed}s elapsed)"
        sleep $wait_interval
        elapsed=$((elapsed + wait_interval))
    done
    
    log_warning "Deletion is taking longer than expected. Check Azure portal for status."
}

# Main teardown function
teardown() {
    log_info "Starting teardown with the following configuration:"
    log_info "  Environment: $ENVIRONMENT"
    log_info "  App Name: $APP_NAME"
    log_info "  Resource Group: $RESOURCE_GROUP"
    log_info "  Deployment Method: $DEPLOYMENT_METHOD"
    log_info "  Force: $FORCE"
    log_info "  Dry Run: $DRY_RUN"
    
    check_prerequisites
    set_subscription
    check_resource_group
    
    if list_resources; then
        cleanup_special_resources
        confirm_deletion
        
        if [[ "$DEPLOYMENT_METHOD" == "terraform" ]]; then
            teardown_terraform
        else
            teardown_bicep
        fi
        
        if [[ "$DEPLOYMENT_METHOD" != "terraform" ]]; then
            monitor_deletion
        fi
        
        if [[ "$DRY_RUN" == false ]]; then
            log_success "Teardown completed successfully!"
        fi
    else
        log_info "No resources to clean up"
    fi
}

# Main script execution
main() {
    parse_args "$@"
    validate_inputs
    teardown
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi