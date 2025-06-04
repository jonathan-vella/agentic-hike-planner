# Azure Cost Optimization Workflow

## Overview
This workflow analyzes Infrastructure-as-Code (IaC) files in the current workspace, maps Azure resources, creates visual diagrams, generates cost optimization recommendations, and creates a GitHub issue with findings.

## Prerequisites
- Azure MCP server configured and authenticated
- GitHub MCP server configured and authenticated  
- IaC files present in workspace (ARM templates, Bicep files, Terraform, etc.)
- Target GitHub repository identified

## Workflow Steps

### Step 1: Analyze Local IaC Files
**Action**: Analyze Infrastructure-as-Code files in the current workspace
**Tools**: Local file system access (not MCP - files are in client workspace)
**Process**:
1. Scan workspace for IaC files:
   - ARM templates (*.json with $schema containing "deploymentTemplate")
   - Bicep files (*.bicep)
   - Terraform files (*.tf)
   - Azure CLI scripts (*.sh, *.ps1 with az commands)
2. Parse and extract Azure resource definitions
3. Identify resource types, configurations, and dependencies
4. Map resource relationships and architecture patterns

### Step 2: Validate Azure Resources & Gather Usage Data
**Action**: Cross-reference IaC definitions with actual Azure resources and collect usage metrics
**MCP Tools Required**:
- **Azure CLI execution** (via terminal/run_in_terminal tool):
  - `az group list` - List all resource groups
  - `az resource list` - List all resources across subscriptions
  - `az webapp list` - List web apps
  - `az functionapp list` - List function apps
  - `az storage account list` - List storage accounts
  - `az cosmosdb list` - List Cosmos DB accounts
  - `az vm list` - List virtual machines
- **Azure Monitor MCP tools**:
  - `azmcp monitor workspace list` - Find Log Analytics workspaces
  - `azmcp monitor table type list` - Discover available monitoring tables
  - `azmcp monitor table list` - List specific tables in workspace
  - `azmcp monitor log query` - Execute KQL queries for usage analysis

**Process**:
1. **Resource Validation**:
   - Execute Azure CLI commands to inventory actual Azure resources
   - Match IaC resource names/patterns with deployed resources
   - Identify discrepancies between IaC definitions and actual deployments
   - Gather current resource configurations (SKUs, tiers, settings)
2. **Usage Data Collection**:
   - Find Log Analytics workspaces linked to the infrastructure
   - Identify available monitoring tables (Perf, Usage, AzureMetrics, etc.)
   - Execute KQL queries to analyze:
     - CPU and memory utilization patterns
     - Storage access patterns and costs
     - Network traffic and bandwidth usage
     - Database query performance and RU consumption
     - Function execution frequency and duration
     - Web app request patterns and response times
3. Calculate baseline usage metrics for cost optimization analysis

### Step 3: Generate Infrastructure Diagram
**Action**: Create Mermaid diagram representing the Azure infrastructure
**Tools**: Local processing (generate Mermaid syntax)
**Process**:
1. Create architecture diagram showing:
   - Resource groups as containers
   - Resources with their types and key properties
   - Dependencies and relationships between resources
   - Network connections and data flows
2. Use Mermaid graph syntax with appropriate Azure icons/styling
3. Include cost-relevant information (SKUs, tiers, instance counts)

### Step 4: Analyze Cost Optimization Opportunities
**Action**: Generate optimization recommendations based on resource analysis AND usage data
**Tools**: Local analysis using Azure resource data + Log Analytics metrics
**Process**:
1. Identify optimization opportunities using BOTH configuration and usage analysis:
   - **Usage-based optimizations** (from Log Analytics KQL queries):
     - Oversized resources with low CPU/memory utilization (< 20% average)
     - Underutilized storage accounts with minimal access patterns
     - Over-provisioned database throughput vs actual RU consumption
     - Functions with low execution frequency
     - Web apps with low traffic that could use smaller SKUs
   - **Configuration-based optimizations** (from IaC and resource configs):
     - Inefficient SKU selections (Premium when Standard works)
     - Missing auto-scaling configurations
     - Redundant or duplicate resources
     - Non-production resources running 24/7
     - Missing reserved instance opportunities
     - Inefficient data storage tiers (Hot when Cool/Archive appropriate)

2. For each recommendation, provide:
   - **Description**: Clear explanation of the optimization
   - **Azure CLI Commands**: Exact `az` commands to implement
   - **Usage Evidence**: KQL query results supporting the recommendation
   - **Pros**: Benefits (cost savings, performance improvements)
   - **Cons**: Risks and potential downsides
   - **Value Score**: 1-10 scale for cost optimization potential
   - **Risk Score**: 1-10 scale for implementation risk
   - **Estimated Monthly Savings**: Dollar amount where calculable

### Step 5: Create GitHub Issue
**Action**: Create comprehensive GitHub issue with findings
**MCP Tools Required**:
- `create_issue` - Create the optimization report issue

**Process**:
1. Create detailed GitHub issue with:
   - **Title**: "Azure Cost Optimization Analysis - [Date]"
   - **Body** containing:
     - Executive summary of findings
     - Infrastructure diagram (Mermaid code block)
     - Detailed optimization recommendations
     - Implementation commands for each recommendation
     - Risk assessment and prioritization matrix

## Issue Template Structure

```markdown
# Azure Cost Optimization Analysis

## Executive Summary
- **Total Resources Analyzed**: X
- **Optimization Opportunities Found**: Y  
- **Estimated Monthly Savings Potential**: $Z
- **High-Priority Recommendations**: N

## Current Infrastructure Architecture

```mermaid
[Generated Mermaid diagram]
```

## Optimization Recommendations

### High Priority (Value: 8-10, Risk: 1-4)

#### 1. [Recommendation Title]
**Description**: [Detailed explanation]
**Estimated Monthly Savings**: $X
**Value Score**: X/10 | **Risk Score**: X/10

**Implementation Commands**:
```bash
az [command 1]
az [command 2]
```

**Pros**:
- [Benefit 1]
- [Benefit 2]

**Cons**:
- [Risk 1]
- [Risk 2]

---

### Medium Priority (Value: 5-7, Risk: 1-6)
[Similar format for medium priority items]

### Low Priority (Value: 1-4 or Risk: 7-10)
[Similar format for low priority items]

## Implementation Roadmap
1. **Week 1**: [High priority, low risk items]
2. **Week 2-3**: [Medium priority items with testing]
3. **Month 2**: [Higher risk items with proper planning]

## Next Steps
- [ ] Review recommendations with team
- [ ] Test implementations in non-production environment
- [ ] Schedule maintenance windows for production changes
- [ ] Set up monitoring for optimized resources
```

## Error Handling
- If Azure MCP tools fail, note in issue and provide manual verification steps
- If no IaC files found, create issue noting need for Infrastructure-as-Code adoption
- If GitHub issue creation fails, output the formatted report to console

## Success Criteria
- Infrastructure diagram accurately represents current state
- Optimization recommendations are actionable with specific commands
- Risk assessment helps prioritize implementation
- GitHub issue serves as implementation tracking tool

## Notes
- This workflow focuses on cost optimization, not security or compliance
- Recommendations should be validated in non-production environments first
- Consider business requirements and SLAs when implementing optimizations
- Regular execution (monthly/quarterly) helps maintain cost efficiency