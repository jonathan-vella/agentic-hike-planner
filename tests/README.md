# Test Suite Documentation

This directory contains comprehensive tests for the Azure Cosmos DB integration and the Hike Planner application.

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   └── database.test.ts     # DatabaseService unit tests
├── integration/             # Integration tests
│   └── azure/               # Azure-specific integration tests
│       └── cosmos-db.test.ts # Cosmos DB integration tests
├── performance/             # Performance and load testing
│   └── cosmos-db-benchmark.ts # Cosmos DB performance benchmarks
└── utils/                   # Test utilities and helpers
    └── azure-test-data.ts   # Azure test data seeding utilities
```

## 🚀 Running Tests

### Prerequisites

1. **Node.js Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Azure Credentials (for integration tests)**
   ```bash
   # For real Azure integration tests (optional)
   export AZURE_COSMOS_DB_ENDPOINT="https://your-cosmos.documents.azure.com:443/"
   export AZURE_COSMOS_DB_KEY="your-cosmos-key"
   
   # Enable write operations in tests (optional, use with caution)
   export RUN_WRITE_TESTS="true"
   ```

### Test Commands

```bash
cd backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run Azure-specific tests
npm run test:azure

# Run performance benchmarks
npm run test:performance
```

## 🧪 Test Modes

### Mock Mode (Default)
- **When**: No Azure credentials provided
- **Behavior**: Uses mock implementations and test data
- **Purpose**: Fast, reliable tests for development and CI/CD

### Real Azure Mode
- **When**: Azure credentials provided via environment variables
- **Behavior**: Tests against real Azure Cosmos DB resources
- **Purpose**: End-to-end validation and integration testing

## 📊 Test Types

### 1. Unit Tests (`tests/unit/`)

Test individual components in isolation:

```typescript
// Example: Database service unit test
test('should create DatabaseService in test mode', () => {
  const service = new DatabaseService(true);
  expect(service).toBeDefined();
});
```

**Coverage**:
- DatabaseService class methods
- Configuration handling
- Error scenarios

### 2. Integration Tests (`tests/integration/azure/`)

Test Azure Cosmos DB integration:

```typescript
// Example: Real Azure connectivity test
test('should connect to Cosmos DB successfully', async () => {
  const health = await databaseService.healthCheck();
  expect(health.status).toBe('healthy');
});
```

**Coverage**:
- Database connectivity
- Container operations
- Query execution
- Error handling
- Authentication methods

### 3. Performance Tests (`tests/performance/`)

Benchmark Azure Cosmos DB operations:

```typescript
// Example: Performance benchmark
const benchmark = new CosmosDbPerformanceBenchmark(client, 'HikePlannerDB', 'users');
const results = await benchmark.runFullBenchmark();
```

**Metrics**:
- Operation latency
- Request Unit (RU) consumption
- Throughput (operations per second)
- Optimization recommendations

## 🛠️ Test Utilities (`tests/utils/`)

### AzureTestDataUtility

Provides utilities for working with test data in Azure:

```typescript
const testData = new AzureTestDataUtility(endpoint, key);

// Seed test data
await testData.seedTestData({
  users: 10,
  trails: 50,
  trips: 20,
  recommendations: 15
});

// Clean up test data
await testData.cleanupTestData('test-');
```

### AzureTestEnvironment

Detects test environment and provides utilities:

```typescript
// Check if running against real Azure
if (AzureTestEnvironment.isRealAzure()) {
  // Run full integration test
} else {
  // Use mock data
}

// Get test data utility
const testUtil = AzureTestEnvironment.getTestDataUtility();
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_COSMOS_DB_ENDPOINT` | Cosmos DB endpoint URL | For Azure tests |
| `AZURE_COSMOS_DB_KEY` | Cosmos DB access key | For Azure tests |
| `RUN_WRITE_TESTS` | Enable write operations in tests | Optional |
| `SILENT_TESTS` | Suppress console output | Optional |

### Jest Configuration

Located in `backend/jest.config.js`:

- **Test Environment**: Node.js
- **Timeout**: 30 seconds (for Azure operations)
- **Workers**: 1 (serial execution for Azure tests)
- **Coverage**: Enabled for `src/` directory

## 🔒 Safety Guidelines

### 1. Test Data Management

- **Prefix**: All test data uses `test-` prefix for easy identification
- **Cleanup**: Automatic cleanup after test completion
- **Isolation**: Tests use separate partition keys to avoid conflicts

### 2. Write Operations

- **Default**: Read-only operations to prevent data modification
- **Enable**: Set `RUN_WRITE_TESTS=true` to enable write tests
- **Cleanup**: Automatic cleanup of test documents

### 3. Resource Usage

- **Throttling**: Tests respect Cosmos DB rate limits
- **Monitoring**: Performance tests track RU consumption
- **Cost**: Minimal cost impact due to optimized test design

## 📈 Test Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All Azure service interactions
- **Performance Tests**: Key operations benchmarked
- **Error Scenarios**: Network failures, authentication errors, throttling

## 🚨 Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```
   Error: Request timeout
   Solution: Check network connectivity and Azure service status
   ```

2. **Authentication Failure**
   ```
   Error: Unauthorized
   Solution: Verify AZURE_COSMOS_DB_KEY is correct and not expired
   ```

3. **Rate Limiting**
   ```
   Error: Too many requests
   Solution: Tests automatically handle retries with exponential backoff
   ```

### Debug Mode

```bash
# Enable verbose test output
DEBUG=true npm run test:azure

# Run single test file
npx jest tests/integration/azure/cosmos-db.test.ts --verbose
```

## 📝 Writing New Tests

### Unit Test Template

```typescript
import { YourService } from '../../backend/src/services/your-service';

describe('YourService Unit Tests', () => {
  test('should perform expected operation', () => {
    const service = new YourService();
    const result = service.someMethod();
    expect(result).toBeDefined();
  });
});
```

### Integration Test Template

```typescript
import { AzureTestEnvironment } from '../../utils/azure-test-data';

describe('Azure Integration Tests', () => {
  beforeAll(() => {
    AzureTestEnvironment.requireRealAzure('Your test description');
  });

  test('should integrate with Azure service', async () => {
    // Your Azure integration test here
  });
});
```

## 📚 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources in `afterEach`/`afterAll`
3. **Timeouts**: Set appropriate timeouts for Azure operations
4. **Error Testing**: Test both success and failure scenarios
5. **Performance**: Monitor RU consumption in tests
6. **Documentation**: Document complex test scenarios

---

**Maintained by**: Hike Planner Development Team  
**Last Updated**: Phase 1 Implementation