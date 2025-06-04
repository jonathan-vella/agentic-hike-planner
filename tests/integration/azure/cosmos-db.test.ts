import { DatabaseService } from '../../../backend/src/services/database';
import { dataSeeder } from '../../../backend/src/services';
import { CosmosClient } from '@azure/cosmos';

describe('Azure Cosmos DB Integration Tests', () => {
  let databaseService: DatabaseService;
  let useRealAzure: boolean;

  beforeAll(async () => {
    // Check if we should use real Azure resources or mock
    useRealAzure = process.env.AZURE_COSMOS_DB_ENDPOINT && process.env.AZURE_COSMOS_DB_KEY ? true : false;
    
    if (useRealAzure) {
      console.log('🔗 Running integration tests against real Azure Cosmos DB');
      databaseService = new DatabaseService(false);
      await databaseService.initialize();
    } else {
      console.log('🧪 Running integration tests in mock mode');
      databaseService = new DatabaseService(true);
    }
  });

  afterAll(async () => {
    if (useRealAzure) {
      await databaseService.close();
    }
  });

  describe('Database Connection', () => {
    test('should connect to Cosmos DB successfully', async () => {
      const health = await databaseService.healthCheck();
      
      if (useRealAzure) {
        expect(health.status).toBe('healthy');
        expect(health.database).toBeDefined();
        expect(health.authenticationType).toMatch(/access-key|azure-ad/);
      } else {
        expect(health.status).toBe('healthy (test mode)');
        expect(health.database).toBe('test');
      }
    });

    test('should have correct authentication type', async () => {
      const health = await databaseService.healthCheck();
      
      if (useRealAzure) {
        expect(health.authenticationType).toBeDefined();
        if (process.env.AZURE_COSMOS_DB_KEY) {
          expect(health.authenticationType).toBe('access-key');
        } else {
          expect(health.authenticationType).toBe('azure-ad');
        }
      }
    });
  });

  describe('Container Operations', () => {
    const containerNames = ['users', 'trips', 'trails', 'recommendations'];

    containerNames.forEach(containerName => {
      test(`should access ${containerName} container`, () => {
        const container = databaseService.getContainer(containerName);
        expect(container).toBeDefined();
      });
    });

    test('should throw error for non-existent container', () => {
      if (useRealAzure) {
        expect(() => {
          databaseService.getContainer('non-existent');
        }).toThrow();
      } else {
        // In test mode, it returns a mock container instead of throwing
        const container = databaseService.getContainer('non-existent');
        expect(container).toBeDefined();
      }
    });
  });

  describe('Data Operations', () => {
    if (process.env.RUN_WRITE_TESTS === 'true') {
      test('should create and read a test document', async () => {
        if (!useRealAzure) {
          console.log('Skipping write test in mock mode');
          return;
        }

        const container = databaseService.getContainer('users');
        
        const testUser = {
          id: `test-user-${Date.now()}`,
          partitionKey: 'test',
          email: 'test@example.com',
          displayName: 'Test User',
          fitnessLevel: 'beginner',
          createdAt: new Date().toISOString(),
          preferences: {
            preferredDifficulty: ['beginner'],
            maxHikingDistance: 10,
            terrainTypes: ['trail'],
            groupSize: 'solo',
          },
          location: {
            city: 'Test City',
            state: 'Test State',
            region: 'test-region',
            country: 'Test Country',
            coordinates: { longitude: 0, latitude: 0 },
          },
        };

        // Create document
        const createResponse = await container.items.create(testUser);
        expect(createResponse.statusCode).toBe(201);

        // Read document
        const readResponse = await container.item(testUser.id, 'test').read();
        expect(readResponse.statusCode).toBe(200);
        expect(readResponse.resource?.email).toBe(testUser.email);

        // Clean up - delete test document
        await container.item(testUser.id, 'test').delete();
      });

      test('should handle TTL for recommendations container', async () => {
        if (!useRealAzure) {
          console.log('Skipping TTL test in mock mode');
          return;
        }

        const container = databaseService.getContainer('recommendations');
        
        const testRecommendation = {
          id: `test-rec-${Date.now()}`,
          partitionKey: 'test',
          userId: 'test-user',
          tripId: 'test-trip',
          trailIds: ['test-trail-1'],
          confidence: 0.85,
          reasons: ['test'],
          expiresAt: new Date(Date.now() + 5000).toISOString(), // 5 seconds TTL
          createdAt: new Date().toISOString(),
          ttl: 5, // 5 seconds
        };

        // Create document with short TTL
        const createResponse = await container.items.create(testRecommendation);
        expect(createResponse.statusCode).toBe(201);

        // Document should exist immediately
        const readResponse = await container.item(testRecommendation.id, 'test').read();
        expect(readResponse.statusCode).toBe(200);

        // Note: TTL deletion happens in the background and may take time
        // In a real test, you might wait and verify deletion, but that's time-consuming
        console.log('TTL test document created - it will be automatically deleted');
      });
    } else {
      test('should skip write tests when RUN_WRITE_TESTS is not set', () => {
        console.log('Write tests skipped. Set RUN_WRITE_TESTS=true to enable them.');
        expect(true).toBe(true);
      });
    }
  });

  describe('Query Operations', () => {
    test('should execute basic query', async () => {
      if (!useRealAzure) {
        console.log('Skipping query test in mock mode');
        return;
      }

      const container = databaseService.getContainer('users');
      
      const query = {
        query: 'SELECT TOP 1 * FROM c',
      };

      const { resources } = await container.items.query(query).fetchAll();
      expect(Array.isArray(resources)).toBe(true);
      // Note: resources might be empty, which is fine for this test
    });

    test('should execute parameterized query', async () => {
      if (!useRealAzure) {
        console.log('Skipping parameterized query test in mock mode');
        return;
      }

      const container = databaseService.getContainer('trails');
      
      const query = {
        query: 'SELECT * FROM c WHERE c.characteristics.difficulty = @difficulty',
        parameters: [
          { name: '@difficulty', value: 'intermediate' }
        ],
      };

      const { resources } = await container.items.query(query).fetchAll();
      expect(Array.isArray(resources)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      if (useRealAzure) {
        // Create a client with invalid endpoint to test error handling
        const invalidClient = new CosmosClient({
          endpoint: 'https://invalid-endpoint.documents.azure.com:443/',
          key: 'invalid-key',
        });

        try {
          await invalidClient.databases.readAll().fetchAll();
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeDefined();
        }
      } else {
        // In test mode, we can't simulate real network errors
        expect(() => {
          databaseService.getContainer('invalid');
        }).not.toThrow(); // Returns mock container
      }
    });

    test('should handle authorization errors', async () => {
      if (useRealAzure && process.env.AZURE_COSMOS_DB_KEY) {
        // Create a client with invalid key
        const invalidClient = new CosmosClient({
          endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT!,
          key: 'invalid-key-that-is-definitely-wrong',
        });

        try {
          await invalidClient.databases.readAll().fetchAll();
          fail('Should have thrown an authorization error');
        } catch (error) {
          expect(error).toBeDefined();
          // Should be authorization/authentication error
        }
      } else {
        console.log('Skipping authorization error test (no key or not using real Azure)');
      }
    });
  });

  describe('Performance Characteristics', () => {
    test('should complete health check within reasonable time', async () => {
      const startTime = Date.now();
      await databaseService.healthCheck();
      const duration = Date.now() - startTime;
      
      // Health check should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    test('should handle concurrent requests', async () => {
      if (!useRealAzure) {
        console.log('Skipping concurrency test in mock mode');
        return;
      }

      const promises = Array.from({ length: 5 }, () => 
        databaseService.healthCheck()
      );

      const results = await Promise.all(promises);
      
      // All health checks should succeed
      results.forEach(result => {
        expect(result.status).toBe('healthy');
      });
    });
  });
});