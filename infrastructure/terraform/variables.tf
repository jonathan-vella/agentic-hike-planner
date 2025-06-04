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
  default     = "East US"
}

variable "app_name" {
  description = "The application name prefix"
  type        = string
  default     = "hike-planner"
}

variable "enable_cosmos_db_free_tier" {
  description = "Enable free tier for Cosmos DB (only one per subscription)"
  type        = bool
  default     = false
}

variable "cosmos_db_throughput_mode" {
  description = "Cosmos DB throughput mode (provisioned or serverless)"
  type        = string
  default     = "serverless"
  validation {
    condition     = contains(["provisioned", "serverless"], var.cosmos_db_throughput_mode)
    error_message = "Throughput mode must be either 'provisioned' or 'serverless'."
  }
}

variable "cosmos_db_min_throughput" {
  description = "Minimum throughput for provisioned mode"
  type        = number
  default     = 400
}

variable "cosmos_db_max_throughput" {
  description = "Maximum throughput for autoscale"
  type        = number
  default     = 4000
}

variable "enable_multi_region" {
  description = "Enable multi-region deployment for production"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "log_retention_days" {
  description = "Log Analytics retention period in days"
  type        = number
  default     = 30
}

variable "daily_log_quota_gb" {
  description = "Daily log ingestion quota in GB"
  type        = number
  default     = 1
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Application = "HikePlanner"
    CostCenter  = "Demo"
  }
}