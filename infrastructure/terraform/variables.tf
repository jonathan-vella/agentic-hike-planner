variable "environment" {
  description = "The environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "The Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "app_name" {
  description = "The application name prefix"
  type        = string
  default     = "hike-planner"
}

# Phase 1: Cosmos DB configuration - Intentionally inefficient for demo
variable "enable_cosmos_db_free_tier" {
  description = "Enable free tier for Cosmos DB (only one per subscription)"
  type        = bool
  default     = false
}

variable "cosmos_db_throughput_mode" {
  description = "Cosmos DB throughput mode - Phase 1 uses intentionally inefficient provisioned mode for demo"
  type        = string
  default     = "provisioned"
  validation {
    condition     = contains(["provisioned", "serverless"], var.cosmos_db_throughput_mode)
    error_message = "Throughput mode must be either 'provisioned' or 'serverless'."
  }
}

variable "cosmos_db_min_throughput" {
  description = "Minimum throughput for provisioned mode - Intentionally high (1,000 RU/s) for demo as per demo.md"
  type        = number
  default     = 1000
}

variable "cosmos_db_max_throughput" {
  description = "Maximum throughput for autoscale - Intentionally high for demo"
  type        = number
  default     = 4000
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Application = "HikePlanner"
    CostCenter  = "Demo"
    Project     = "Agentic Hike Planner"
    Phase       = "1"
  }
}