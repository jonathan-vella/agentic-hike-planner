---
mode: agent
description: Validate a Pull Request (PR) locally by checking it out, verifying outcomes against the related issue, and posting results back to GitHub.
author: Daniel Meppiel
mcp:
  - ghcr.io/github/github-mcp-server
---

# Validate PR Locally

## Description
This prompt helps validate a Pull Request (PR) by checking it out locally and verifying that all outcomes outlined in the related issue are met. The validation realizing any activity required to validate the outcomes stated in the issue, and posting comprehensive validation results back to the GitHub issue.

## MCP Servers Required
- **GitHub MCP Server**: For fetching PR details, related issues, and posting validation comments

## Parameters
- `pr_identifier`: The PR number (e.g., "59") or full PR URL (e.g., "https://github.com/owner/repo/pull/59")

## Instructions

You are tasked with validating Pull Request **{{pr_identifier}}** by performing a comprehensive local validation against its related issue requirements.

### Phase 1: Information Gathering
1. **Fetch PR Details**: Use the GitHub MCP server to retrieve:
   - PR title, description, and related issue number
   - Changed files and code diff summary
   - Current branch name and status

2. **Fetch Related Issue**: Get the linked issue to understand:
   - Acceptance criteria and success metrics
   - Expected outcomes and deliverables
   - Technical requirements and validation steps

3. **Assess Current Environment**: Check:
   - Current git branch and workspace state
   - Whether you're already on the PR branch
   - Any other environment-specific requirements to be able to validate the PR

### Phase 2: Local Setup
1. **Branch Management**:
   - If not on the PR branch, check it out: `git checkout <pr-branch>`
   - Ensure the branch is up to date with origin
   - Verify the working directory is clean

2. **Security Review**:
   - Scan parameter files and configuration for hardcoded sensitive data
   - Ensure environment variables are used for secrets (emails, keys, etc.)
   - Update security practices if needed

### Phase 3: Validation Execution

   - Validate that all expected outcomes from the issue are met
   - Test any new functionality or changes introduced by the PR
   - Verify that existing functionality is not broken

### Phase 4: Validation Documentation
1. **Results Analysis**:
   - Compare actual results against issue acceptance criteria
   - Document what works vs. what doesn't
   - Identify any gaps or improvements needed

### Phase 5: Reporting
1. **GitHub Comment**: Post a comprehensive validation comment to the related issue including:
   - ✅/❌ status for each acceptance criterion
   - Detailed technical validation results
   - Cost impact analysis (if applicable)
   - Security improvements made
   - Screenshots or output examples
   - Clear recommendation (merge/needs work)

2. **Summary Format**:
   ```markdown
   ## [PR Title] Validation Results ✅/❌
   
   ### ✅ Acceptance Criteria Validation
   [Detailed checklist of requirements]
   
   ### 🏗️ Technical Validation
   [Infrastructure, code, integration results]
   
   ### 📊 Cost/Performance Impact
   [Resource costs, optimization opportunities]
   
   ### 🔐 Security Review
   [Security improvements, compliance checks]
   
   ### 🎯 Recommendation
   [Clear merge/needs-work recommendation with rationale]
   ```

### Best Practices
1. **Be Thorough**: Check every acceptance criterion from the issue
2. **Be Secure**: Never commit sensitive data, always use environment variables
3. **Be Practical**: Test actual deployments, don't just validate syntax
4. **Be Clear**: Provide actionable feedback and clear recommendations
5. **Be Efficient**: Use parallel operations where possible to save time

### Success Criteria
The validation is complete when:
- ✅ All issue acceptance criteria are verified (pass/fail)
- ✅ Actual deployment testing performed (if applicable)
- ✅ Security review completed with improvements made
- ✅ Comprehensive validation results posted to GitHub issue
- ✅ Clear merge recommendation provided with rationale

Remember: The goal is to provide the PR author and reviewers with confidence that the changes work as intended and meet all specified requirements.
