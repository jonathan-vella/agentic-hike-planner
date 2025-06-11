#!/bin/bash

# Azure Hike Planner Template Validation Script
# This script validates Bicep and Terraform templates without deploying them

set -euo pipefail

# Default values
ENVIRONMENT="dev"
LOCATION="eastus"
APP_NAME="hike-planner"
RESOURCE_GROUP=""
SUBSCRIPTION_ID=""
TEMPLATE_TYPE="all"
VERBOSE=false

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
Azure Hike Planner Template Validation Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment    Environment name (dev/staging/prod) [default: dev]
    -l, --location       Azure region [default: eastus]
    -a, --app-name       Application name prefix [default: hike-planner]
    -g, --resource-group Resource group name for validation [optional]
    -s, --subscription   Azure subscription ID [optional]
    -t, --type           Template type to validate (bicep/terraform/all) [default: all]
    -v, --verbose        Enable verbose output [default: false]
    -h, --help           Show this help message

Examples:
    # Validate all templates
    $0

    # Validate only Bicep templates
    $0 --type bicep --environment prod

    # Validate with specific resource group
    $0 --resource-group rg-validation --verbose

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
            -l|--location)
                LOCATION="$2"
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
            -t|--type)
                TEMPLATE_TYPE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
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
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        log_error "Environment must be one of: dev, staging, prod"
        exit 1
    fi

    if [[ ! "$TEMPLATE_TYPE" =~ ^(bicep|terraform|all)$ ]]; then
        log_error "Template type must be one of: bicep, terraform, all"
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

    # Check if logged in to Azure (only if resource group is specified)
    if [[ -n "$RESOURCE_GROUP" ]]; then
        if ! az account show &> /dev/null; then
            log_error "Not logged in to Azure. Please run 'az login' first."
            exit 1
        fi
    fi

    # Check if Terraform is installed (if validating Terraform)
    if [[ "$TEMPLATE_TYPE" == "terraform" || "$TEMPLATE_TYPE" == "all" ]]; then
        if ! command -v terraform &> /dev/null; then
            log_warning "Terraform is not installed. Skipping Terraform validation."
            if [[ "$TEMPLATE_TYPE" == "terraform" ]]; then
                log_error "Terraform is required for Terraform validation"
                exit 1
            fi
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
    
    if [[ -n "$RESOURCE_GROUP" ]]; then
        local current_subscription=$(az account show --query name -o tsv)
        log_info "Using Azure subscription: $current_subscription"
    fi
}

# Create temporary resource group for validation
create_temp_resource_group() {
    if [[ -z "$RESOURCE_GROUP" ]]; then
        RESOURCE_GROUP="rg-validation-$(date +%Y%m%d%H%M%S)"
        log_info "Creating temporary resource group for validation: $RESOURCE_GROUP"
        
        az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags \
            Purpose="Template Validation" \
            CreatedBy="validation-script" \
            DeleteAfter="$(date -d '+1 hour' -Iseconds)"
        
        # Set flag to delete it later
        TEMP_RG=true
    else
        TEMP_RG=false
        log_info "Using existing resource group for validation: $RESOURCE_GROUP"
    fi
}

# Clean up temporary resource group
cleanup_temp_resource_group() {
    if [[ "$TEMP_RG" == true ]]; then
        log_info "Cleaning up temporary resource group: $RESOURCE_GROUP"
        az group delete --name "$RESOURCE_GROUP" --yes --no-wait
    fi
}

# Validate Bicep templates
validate_bicep() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local bicep_dir="$script_dir/../infrastructure/bicep"
    local validation_failed=false
    
    log_info "Validating Bicep templates..."
    
    # Validate main template
    local main_template="$bicep_dir/main.bicep"
    local parameters_file="$bicep_dir/parameters/${ENVIRONMENT}.json"
    
    if [[ ! -f "$main_template" ]]; then
        log_error "Main Bicep template not found: $main_template"
        return 1
    fi
    
    if [[ ! -f "$parameters_file" ]]; then
        log_error "Parameters file not found: $parameters_file"
        return 1
    fi
    
    log_info "Validating main.bicep with $ENVIRONMENT parameters..."
    
    # Bicep build validation
    if az bicep build --file "$main_template" --outfile "/tmp/main.json" &> /dev/null; then
        log_success "Bicep build validation passed"
    else
        log_error "Bicep build validation failed"
        validation_failed=true
    fi
    
    # Template syntax validation
    if az deployment group validate \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$main_template" \
        --parameters "@$parameters_file" \
        --only-show-errors &> /dev/null; then
        log_success "Bicep template syntax validation passed"
    else
        log_error "Bicep template syntax validation failed"
        if [[ "$VERBOSE" == true ]]; then
            az deployment group validate \
                --resource-group "$RESOURCE_GROUP" \
                --template-file "$main_template" \
                --parameters "@$parameters_file"
        fi
        validation_failed=true
    fi
    
    # Validate Cosmos DB module
    local cosmos_module="$bicep_dir/modules/cosmos-db.bicep"
    
    if [[ -f "$cosmos_module" ]]; then
        log_info "Validating cosmos-db.bicep module..."
        
        if az bicep build --file "$cosmos_module" --outfile "/tmp/cosmos-db.json" &> /dev/null; then
            log_success "Cosmos DB module validation passed"
        else
            log_error "Cosmos DB module validation failed"
            validation_failed=true
        fi
    fi
    
    # Validate Phase 2 modules
    local app_service_plan_module="$bicep_dir/modules/app-service-plan.bicep"
    local app_service_module="$bicep_dir/modules/app-service.bicep"
    local budget_alerts_module="$bicep_dir/modules/budget-alerts.bicep"
    
    if [[ -f "$app_service_plan_module" ]]; then
        log_info "Validating app-service-plan.bicep module..."
        
        if az bicep build --file "$app_service_plan_module" --outfile "/tmp/app-service-plan.json" &> /dev/null; then
            log_success "App Service Plan module validation passed"
        else
            log_error "App Service Plan module validation failed"
            validation_failed=true
        fi
    fi
    
    if [[ -f "$app_service_module" ]]; then
        log_info "Validating app-service.bicep module..."
        
        if az bicep build --file "$app_service_module" --outfile "/tmp/app-service.json" &> /dev/null; then
            log_success "App Service module validation passed"
        else
            log_error "App Service module validation failed"
            validation_failed=true
        fi
    fi
    
    if [[ -f "$budget_alerts_module" ]]; then
        log_info "Validating budget-alerts.bicep module..."
        
        if az bicep build --file "$budget_alerts_module" --outfile "/tmp/budget-alerts.json" &> /dev/null; then
            log_success "Budget Alerts module validation passed"
        else
            log_error "Budget Alerts module validation failed"
            validation_failed=true
        fi
    fi
    
    # Clean up temporary files
    rm -f /tmp/main.json /tmp/cosmos-db.json /tmp/app-service-plan.json /tmp/app-service.json /tmp/budget-alerts.json
    
    if [[ "$validation_failed" == true ]]; then
        return 1
    fi
    
    return 0
}

# Validate Terraform templates
validate_terraform() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local terraform_dir="$script_dir/../infrastructure/terraform"
    local validation_failed=false
    
    log_info "Validating Terraform templates..."
    
    # Check if Terraform directory exists
    if [[ ! -d "$terraform_dir" ]]; then
        log_error "Terraform directory not found: $terraform_dir"
        return 1
    fi
    
    # Change to Terraform directory
    cd "$terraform_dir"
    
    # Create test variables file
    local vars_file="validation.tfvars"
    cat > "$vars_file" << EOF
environment = "$ENVIRONMENT"
location = "$LOCATION"
app_name = "$APP_NAME"
enable_cosmos_db_free_tier = false
EOF
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    if terraform init &> /dev/null; then
        log_success "Terraform initialization passed"
    else
        log_error "Terraform initialization failed"
        validation_failed=true
    fi
    
    # Validate Terraform configuration
    log_info "Validating Terraform configuration..."
    if terraform validate &> /dev/null; then
        log_success "Terraform configuration validation passed"
    else
        log_error "Terraform configuration validation failed"
        if [[ "$VERBOSE" == true ]]; then
            terraform validate
        fi
        validation_failed=true
    fi
    
    # Format check
    log_info "Checking Terraform formatting..."
    if terraform fmt -check &> /dev/null; then
        log_success "Terraform formatting check passed"
    else
        log_warning "Terraform formatting check failed (code style issue, not blocking)"
        if [[ "$VERBOSE" == true ]]; then
            terraform fmt -check
        fi
    fi
    
    # Plan validation (if we have resource group)
    if [[ -n "$RESOURCE_GROUP" ]]; then
        log_info "Creating Terraform plan for validation..."
        if terraform plan -var-file="$vars_file" -out="/tmp/tfplan" &> /dev/null; then
            log_success "Terraform plan validation passed"
        else
            log_error "Terraform plan validation failed"
            if [[ "$VERBOSE" == true ]]; then
                terraform plan -var-file="$vars_file"
            fi
            validation_failed=true
        fi
        
        # Clean up plan file
        rm -f /tmp/tfplan
    fi
    
    # Clean up
    rm -f "$vars_file"
    
    if [[ "$validation_failed" == true ]]; then
        return 1
    fi
    
    return 0
}

# Validate template structure
validate_structure() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root="$script_dir/.."
    
    log_info "Validating project structure..."
    
    # Check infrastructure directory structure
    local required_files=(
        "infrastructure/bicep/main.bicep"
        "infrastructure/bicep/modules/cosmos-db.bicep"
        "infrastructure/bicep/modules/app-service-plan.bicep"
        "infrastructure/bicep/modules/app-service.bicep"
        "infrastructure/bicep/modules/budget-alerts.bicep"
        "infrastructure/bicep/parameters/dev.json"
        "infrastructure/bicep/parameters/staging.json"
        "infrastructure/bicep/parameters/prod.json"
        "infrastructure/terraform/main.tf"
        "infrastructure/terraform/variables.tf"
        "infrastructure/terraform/outputs.tf"
        "scripts/deploy.sh"
        "scripts/teardown.sh"
        "scripts/validate.sh"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$project_root/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        log_success "Project structure validation passed"
        return 0
    else
        log_error "Project structure validation failed"
        log_error "Missing files:"
        for file in "${missing_files[@]}"; do
            log_error "  - $file"
        done
        return 1
    fi
}

# Main validation function
validate() {
    log_info "Starting template validation with the following configuration:"
    log_info "  Environment: $ENVIRONMENT"
    log_info "  Location: $LOCATION"
    log_info "  App Name: $APP_NAME"
    log_info "  Resource Group: ${RESOURCE_GROUP:-"(will create temporary)"}"
    log_info "  Template Type: $TEMPLATE_TYPE"
    log_info "  Verbose: $VERBOSE"
    
    check_prerequisites
    set_subscription
    
    # Create temporary resource group if needed
    if [[ -n "$RESOURCE_GROUP" ]] || [[ "$TEMPLATE_TYPE" == "bicep" ]] || [[ "$TEMPLATE_TYPE" == "all" ]]; then
        create_temp_resource_group
    fi
    
    local validation_passed=true
    
    # Validate project structure
    if ! validate_structure; then
        validation_passed=false
    fi
    
    # Validate templates based on type
    case "$TEMPLATE_TYPE" in
        "bicep")
            if ! validate_bicep; then
                validation_passed=false
            fi
            ;;
        "terraform")
            if command -v terraform &> /dev/null; then
                if ! validate_terraform; then
                    validation_passed=false
                fi
            else
                log_warning "Terraform not installed, skipping Terraform validation"
            fi
            ;;
        "all")
            if ! validate_bicep; then
                validation_passed=false
            fi
            
            if command -v terraform &> /dev/null; then
                if ! validate_terraform; then
                    validation_passed=false
                fi
            else
                log_warning "Terraform not installed, skipping Terraform validation"
            fi
            ;;
    esac
    
    # Clean up temporary resource group
    if [[ "$TEMP_RG" == true ]]; then
        cleanup_temp_resource_group
    fi
    
    if [[ "$validation_passed" == true ]]; then
        log_success "All validations passed successfully!"
        log_info ""
        log_info "Templates are ready for deployment."
        log_info "You can now run the deployment script with confidence."
        exit 0
    else
        log_error "Validation failed!"
        log_error "Please fix the issues above before deploying."
        exit 1
    fi
}

# Main script execution
main() {
    parse_args "$@"
    validate_inputs
    validate
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi