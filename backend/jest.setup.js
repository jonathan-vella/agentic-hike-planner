// Global Jest setup
console.log('🧪 Setting up test environment...');

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock console methods for cleaner test output (optional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Setup Azure test environment detection
global.isAzureTestEnvironment = !!(
  process.env.AZURE_COSMOS_DB_ENDPOINT && 
  process.env.AZURE_COSMOS_DB_KEY
);

if (global.isAzureTestEnvironment) {
  console.log('🔗 Running tests against real Azure resources');
} else {
  console.log('🧪 Running tests in mock mode');
}