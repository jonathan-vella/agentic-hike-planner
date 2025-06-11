import { describe, test, expect } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

describe('Phase 2 Infrastructure Validation', () => {
  const bicepDir = path.join(__dirname, '../../../infrastructure/bicep');
  const modulesDir = path.join(bicepDir, 'modules');

  test('should validate main.bicep template syntax', async () => {
    const { stdout, stderr } = await execAsync(`az bicep build --file ${path.join(bicepDir, 'main.bicep')}`);
    
    // If build succeeds without errors, validation passes
    expect(stderr).toBe('');
  }, 30000);

  test('should validate app-service-plan.bicep module', async () => {
    const { stdout, stderr } = await execAsync(`az bicep build --file ${path.join(modulesDir, 'app-service-plan.bicep')}`);
    
    expect(stderr).toBe('');
  }, 30000);

  test('should validate app-service.bicep module', async () => {
    const { stdout, stderr } = await execAsync(`az bicep build --file ${path.join(modulesDir, 'app-service.bicep')}`);
    
    expect(stderr).toBe('');
  }, 30000);

  test('should validate budget-alerts.bicep module', async () => {
    const { stdout, stderr } = await execAsync(`az bicep build --file ${path.join(modulesDir, 'budget-alerts.bicep')}`);
    
    expect(stderr).toBe('');
  }, 30000);

  test('should have required parameter files', () => {
    const fs = require('fs');
    
    const devParams = path.join(bicepDir, 'parameters/dev.json');
    const stagingParams = path.join(bicepDir, 'parameters/staging.json');
    const prodParams = path.join(bicepDir, 'parameters/prod.json');
    
    expect(fs.existsSync(devParams)).toBe(true);
    expect(fs.existsSync(stagingParams)).toBe(true);
    expect(fs.existsSync(prodParams)).toBe(true);
  });

  test('should have budget alert email in parameter files', () => {
    const fs = require('fs');
    
    const devParams = JSON.parse(fs.readFileSync(path.join(bicepDir, 'parameters/dev.json'), 'utf8'));
    const stagingParams = JSON.parse(fs.readFileSync(path.join(bicepDir, 'parameters/staging.json'), 'utf8'));
    const prodParams = JSON.parse(fs.readFileSync(path.join(bicepDir, 'parameters/prod.json'), 'utf8'));
    
    expect(devParams.parameters.budgetAlertEmail).toBeDefined();
    expect(stagingParams.parameters.budgetAlertEmail).toBeDefined();
    expect(prodParams.parameters.budgetAlertEmail).toBeDefined();
    
    expect(devParams.parameters.budgetAlertEmail.value).toBe('demo@example.com');
    expect(stagingParams.parameters.budgetAlertEmail.value).toBe('demo@example.com');
    expect(prodParams.parameters.budgetAlertEmail.value).toBe('demo@example.com');
  });
});