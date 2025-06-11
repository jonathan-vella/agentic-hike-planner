# Azure Cost Optimization Workflow

## Overview
This workflow analyzes Infrastructure-as-Code (IaC) files and Azure resources to generate cost optimization recommendations. It creates individual GitHub issues for each optimization opportunity plus one EPIC issue to coordinate implementation, enabling efficient tracking and execution of cost savings initiatives.

## Prerequisites
- Azure MCP server configured and authenticated
- GitHub MCP server configured and authenticated  
- Target GitHub repository identified
- Azure resources deployed (IaC files optional but helpful)

## Workflow Steps

### Step 1: Discover Azure Infrastructure
**Action**: Dynamically discover and analyze Azure resources and configurations
**Tools**: Azure CLI execution + Local file system access
**Process**:
1. **Resource Discovery**:
   - Execute `az group list` to find all resource groups
   - Execute `az resource list --query "[].{name:name, type:type, resourceGroup:resourceGroup, location:location}"` 
   - For each resource type found, execute specific list commands:
     - `az webapp list` - Web Apps and App Service Plans
     - `az functionapp list` - Function Apps
     - `az storage account list` - Storage Accounts
     - `az cosmosdb list` - Cosmos DB Accounts
     - `az vm list` - Virtual Machines
     - `az sql server list` - SQL Servers and Databases
     - `az redis list` - Redis Cache instances
     - `az cdn profile list` - CDN Profiles
     - `az keyvault list` - Key Vaults
     - `az monitor app-insights component list` - Application Insights

2. **IaC Analysis** (if available):
   - Scan workspace for IaC files: ARM templates (*.json), Bicep files (*.bicep), Terraform files (*.tf)
   - Parse resource definitions to understand intended configurations
   - Compare IaC definitions with deployed resources to identify drift

3. **Configuration Analysis**:
   - Extract current SKUs, tiers, and settings for each resource
   - Identify resource relationships and dependencies
   - Map resource utilization patterns where available

### Step 2: Collect Usage Metrics
**Action**: Gather performance and utilization data from Azure Monitor
**Tools**: Azure Monitor MCP tools + Azure CLI
**Process**:
1. **Find Monitoring Sources**:
   - Execute `az monitor log-analytics workspace list` to find Log Analytics workspaces
   - Use Azure MCP: `azmcp monitor workspace list` and `azmcp monitor table list`

2. **Execute Usage Queries** (sample KQL queries):
   ```kql
   // CPU utilization for App Services
   AppServiceAppLogs
   | where TimeGenerated > ago(7d)
   | summarize avg(CpuTime) by Resource, bin(TimeGenerated, 1h)
   
   // Cosmos DB RU consumption
   AzureDiagnostics
   | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
   | where TimeGenerated > ago(7d)
   | summarize avg(RequestCharge) by Resource
   
   // Storage account access patterns
   StorageBlobLogs
   | where TimeGenerated > ago(7d)
   | summarize RequestCount=count() by AccountName, bin(TimeGenerated, 1d)
   ```

3. **Calculate Baseline Metrics**:
   - CPU/Memory utilization averages
   - Database throughput patterns
   - Storage access frequency
   - Function execution rates

### Step 3: Generate Cost Optimization Recommendations
**Action**: Analyze resources and usage to identify optimization opportunities
**Tools**: Local analysis using collected data
**Process**:
1. **Apply Optimization Patterns** based on resource types found:
   
   **Compute Optimizations**:
   - App Service Plans: Right-size based on CPU/memory usage
   - Function Apps: Premium → Consumption plan for low usage
   - Virtual Machines: Scale down oversized instances
   
   **Database Optimizations**:
   - Cosmos DB: Provisioned → Serverless for variable workloads
   - SQL Database: Right-size service tiers based on DTU usage
   
   **Storage Optimizations**:
   - Implement lifecycle policies (Hot → Cool → Archive)
   - Consolidate redundant storage accounts
   - Right-size storage tiers based on access patterns
   
   **Infrastructure Optimizations**:
   - Remove unused/redundant resources
   - Implement auto-scaling where beneficial
   - Schedule non-production environments

2. **Calculate Priority Score** for each recommendation:
   ```
   Priority Score = (Value Score × Monthly Savings) / (Risk Score × Implementation Days)
   
   High Priority: Score > 20
   Medium Priority: Score 5-20
   Low Priority: Score < 5
   ```

3. **Validate Recommendations**:
   - Ensure Azure CLI commands are accurate
   - Verify estimated savings calculations
   - Assess implementation risks and prerequisites

### Step 4: User Confirmation
**Action**: Present summary and get approval before creating GitHub issues
**Process**:
1. **Display Optimization Summary**:
   ```
   🎯 Azure Cost Optimization Summary
   
   📊 Analysis Results:
   • Total Resources Analyzed: X
   • Optimization Opportunities: Y
   • Estimated Monthly Savings: $Z
   • High Priority Items: N
   
   🏆 Recommendations:
   1. [Title] - $X/month savings - [Risk Level]
   2. [Title] - $X/month savings - [Risk Level] 
   3. [Title] - $X/month savings - [Risk Level]
   ... and so on
   
   💡 This will create:
   • Y individual GitHub issues (one per optimization)
   • 1 EPIC issue to coordinate implementation
   
   ❓ Proceed with creating GitHub issues? (y/n)
   ```

2. **Wait for User Confirmation**: Only proceed if user confirms

### Step 5: Create Individual Optimization Issues
**Action**: Create separate GitHub issues for each optimization opportunity
**MCP Tools Required**: `create_issue` for each recommendation
**Process**:
1. **Create Individual Issues** using this template:

   **Title Format**: `[COST-OPT] [Resource Type] - [Brief Description] - $X/month savings`
   
   **Body Template**:
   ```markdown
   ## 💰 Cost Optimization: [Brief Title]
   
   **Monthly Savings**: $X | **Risk Level**: [Low/Medium/High] | **Implementation Effort**: X days
   
   ### 📋 Description
   [Clear explanation of the optimization and why it's needed]
   
   ### 🔧 Implementation
   ```bash
   # Commands to implement this optimization
   az [command 1]
   az [command 2]
   ```
   
   ### 📊 Evidence
   - Current Configuration: [details]
   - Usage Pattern: [evidence from monitoring data]
   - Cost Impact: $X/month → $Y/month
   
   ### ✅ Validation Steps
   - [ ] Test in non-production environment
   - [ ] Verify no performance degradation
   - [ ] Confirm cost reduction in Azure Cost Management
   - [ ] Update monitoring and alerts if needed
   
   ### ⚠️ Risks & Considerations
   - [Risk 1 and mitigation]
   - [Risk 2 and mitigation]
   
   **Priority Score**: X | **Value**: X/10 | **Risk**: X/10
   ```

### Step 6: Create EPIC Coordinating Issue
**Action**: Create master issue to track all optimization work
**MCP Tools Required**: `create_issue` for EPIC
**Process**:
1. **Create EPIC Issue**:

   **Title**: `[EPIC] Azure Cost Optimization Initiative - $X/month potential savings`
   
   **Body Template**:
   ```markdown
   # 🎯 Azure Cost Optimization EPIC
   
   **Total Potential Savings**: $X/month | **Implementation Timeline**: X weeks
   
   ## 📊 Executive Summary
   - **Resources Analyzed**: X
   - **Optimization Opportunities**: Y  
   - **Total Monthly Savings Potential**: $X
   - **High Priority Items**: N
   
   ## 🏗️ Current Architecture Overview
   
   ```mermaid
   graph TB
       subgraph "Resource Group: [name]"
           [Generated architecture diagram showing current resources and costs]
       end
   ```
   
   ## 📋 Implementation Tracking
   
   ### 🚀 High Priority (Implement First)
   - [ ] #[issue-number]: [Title] - $X/month savings
   - [ ] #[issue-number]: [Title] - $X/month savings
   
   ### ⚡ Medium Priority 
   - [ ] #[issue-number]: [Title] - $X/month savings
   - [ ] #[issue-number]: [Title] - $X/month savings
   
   ### 🔄 Low Priority (Nice to Have)
   - [ ] #[issue-number]: [Title] - $X/month savings
   
   ## 📈 Progress Tracking
   - **Completed**: 0 of Y optimizations
   - **Savings Realized**: $0 of $X/month
   - **Implementation Status**: Not Started
   
   ## 🎯 Success Criteria
   - [ ] All high-priority optimizations implemented
   - [ ] >80% of estimated savings realized
   - [ ] No performance degradation observed
   - [ ] Cost monitoring dashboard updated
   
   ## 📝 Notes
   - Review and update this EPIC as issues are completed
   - Monitor actual vs. estimated savings
   - Consider scheduling regular cost optimization reviews
   ```

## Error Handling
- **Azure Authentication Failure**: Provide manual Azure CLI setup steps
- **No Resources Found**: Create informational issue about Azure resource deployment
- **GitHub Creation Failure**: Output formatted recommendations to console
- **Insufficient Usage Data**: Note limitations and provide configuration-based recommendations only

## Success Criteria
- ✅ Individual issues created for each optimization (trackable and assignable)
- ✅ EPIC issue provides comprehensive coordination and tracking
- ✅ All recommendations include specific, executable Azure CLI commands
- ✅ Priority scoring enables ROI-focused implementation
- ✅ Architecture diagram accurately represents current state
- ✅ User confirmation prevents unwanted issue creation

## Notes
- This workflow is architecture-agnostic and adapts to any Azure deployment
- Focus on cost optimization, not security or compliance
- Recommendations should be validated in non-production environments first
- Consider business requirements and SLAs when implementing optimizations
- Regular execution (monthly/quarterly) maintains cost efficiency