#!/bin/bash

# This script sets up Azure authentication for local development

# Usage instructions
echo "===== Azure Local Authentication Setup ====="
echo "This script helps set up Azure authentication for local development."
echo "Prerequisites:"
echo "  1. Azure CLI installed and logged in"
echo "  2. Required roles on your Azure Cosmos DB instance"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null
then
    echo "Error: Azure CLI not found. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
echo "Checking Azure CLI login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Azure CLI. Please login:"
    az login
fi

echo "Getting your account information..."
USER_EMAIL=$(az account show --query "user.name" -o tsv)
USER_OBJECT_ID=$(az ad signed-in-user show --query "id" -o tsv)

echo "Your account: $USER_EMAIL"
echo "Your object ID: $USER_OBJECT_ID"
echo ""

# Ask for Cosmos DB account name
read -p "Enter your Azure Cosmos DB account name: " COSMOS_ACCOUNT_NAME
echo ""

# Ask for resource group name
read -p "Enter the resource group name containing the Cosmos DB account: " RESOURCE_GROUP

# Get the current subscription
SUBSCRIPTION=$(az account show --query "id" -o tsv)
echo "Using subscription: $SUBSCRIPTION"
echo ""

# Verify Cosmos DB account exists
echo "Verifying Cosmos DB account..."
az cosmosdb show --name $COSMOS_ACCOUNT_NAME --resource-group $RESOURCE_GROUP &> /dev/null
if [ $? -ne 0 ]; then
    echo "Error: Cosmos DB account not found or you don't have permissions to access it."
    exit 1
fi

# Assign roles
echo "Would you like to assign the required role to your user account? (y/n)"
read ASSIGN_ROLES

if [[ "$ASSIGN_ROLES" == "y" || "$ASSIGN_ROLES" == "Y" ]]; then
    echo "Assigning Cosmos DB Data Contributor role to your account..."
    az cosmosdb sql role assignment create \
        --account-name $COSMOS_ACCOUNT_NAME \
        --resource-group $RESOURCE_GROUP \
        --role-definition-id 00000000-0000-0000-0000-000000000002 \
        --principal-id $USER_OBJECT_ID \
        --scope "/"
    
    if [ $? -ne 0 ]; then
        echo "Warning: Failed to assign roles. You may need to ask your Azure administrator to assign the roles."
    else
        echo "Roles assigned successfully!"
    fi
else
    echo "Skipping role assignment. Make sure you have the necessary roles assigned."
fi

# Generate the .env updates
echo ""
echo "Add the following lines to your .env file:"
echo "-----------------------------------"
echo "# Azure AD Authentication"
echo "USE_AAD_AUTH=true"
echo "AZURE_COSMOS_DB_DATABASE_NAME=HikePlannerDB"
echo "# Comment out or remove AZURE_COSMOS_DB_KEY"
echo "-----------------------------------"
echo ""

# Instructions for Azure CLI
echo "Make sure you're logged in to the Azure CLI with the same account that has access to the Cosmos DB."
echo "Run 'az login' if you need to log in again."
echo ""
echo "Setup completed. You may need to restart your application for the changes to take effect."
