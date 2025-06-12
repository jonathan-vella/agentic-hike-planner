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

# Cosmos DB configuration
variable "enable_cosmos_db_free_tier" {
  description = "Enable free tier for Cosmos DB (only one per subscription)"
  type        = bool
  default     = false
}

variable "cosmos_db_throughput_mode" {
  description = "Cosmos DB throughput mode"
  type        = string
  default     = "provisioned"
  validation {
    condition     = contains(["provisioned", "serverless"], var.cosmos_db_throughput_mode)
    error_message = "Throughput mode must be either 'provisioned' or 'serverless'."
  }
}

variable "cosmos_db_min_throughput" {
  description = "Minimum throughput for provisioned mode"
  type        = number
  default     = 1000
}

variable "cosmos_db_max_throughput" {
  description = "Maximum throughput for autoscale"
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