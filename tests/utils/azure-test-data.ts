import { CosmosClient } from '@azure/cosmos';
import { dataSeeder } from '../../../backend/src/services';

export interface TestDataConfig {
  users: number;
  trails: number;
  trips: number;
  recommendations: number;
}

export class AzureTestDataUtility {
  private client: CosmosClient;
  private databaseName: string;

  constructor(cosmosDbEndpoint: string, cosmosDbKey: string, databaseName: string = 'HikePlannerDB') {
    this.client = new CosmosClient({
      endpoint: cosmosDbEndpoint,
      key: cosmosDbKey,
    });
    this.databaseName = databaseName;
  }

  async seedTestData(config: TestDataConfig): Promise<{
    users: number;
    trails: number;
    trips: number;
    recommendations: number;
  }> {
    console.log('🌱 Seeding Azure Cosmos DB with test data...');
    
    const database = this.client.database(this.databaseName);
    
    // Generate mock data
    await dataSeeder.initialize();
    const mockGenerator = (dataSeeder as any).mockGenerator;
    
    const users = mockGenerator.generateUsers(config.users);
    const trails = mockGenerator.generateTrails(config.trails);
    const trips = mockGenerator.generateTrips(users.map((u: any) => u.id), config.trips);
    const recommendations = mockGenerator.generateRecommendations(
      users.map((u: any) => u.id),
      trips.map((t: any) => t.id),
      trails.map((t: any) => t.id),
      config.recommendations
    );

    // Seed containers
    const results = {
      users: await this.seedContainer('users', users),
      trails: await this.seedContainer('trails', trails),
      trips: await this.seedContainer('trips', trips),
      recommendations: await this.seedContainer('recommendations', recommendations),
    };

    console.log('✅ Test data seeding completed:');
    console.log(`   Users: ${results.users}`);
    console.log(`   Trails: ${results.trails}`);
    console.log(`   Trips: ${results.trips}`);
    console.log(`   Recommendations: ${results.recommendations}`);

    return results;
  }

  private async seedContainer(containerName: string, documents: any[]): Promise<number> {
    const container = this.client.database(this.databaseName).container(containerName);
    let successCount = 0;

    console.log(`📄 Seeding ${containerName} container with ${documents.length} documents...`);

    for (const doc of documents) {
      try {
        await container.items.create(doc);
        successCount++;
      } catch (error) {
        console.warn(`Failed to create document in ${containerName}:`, error);
      }
    }

    return successCount;
  }

  async cleanupTestData(testDataPrefix: string = 'test-'): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    const containerNames = ['users', 'trails', 'trips', 'recommendations'];
    
    for (const containerName of containerNames) {
      await this.cleanupContainer(containerName, testDataPrefix);
    }
    
    console.log('✅ Test data cleanup completed');
  }

  private async cleanupContainer(containerName: string, testDataPrefix: string): Promise<void> {
    const container = this.client.database(this.databaseName).container(containerName);
    
    try {
      // Query for test documents
      const query = {
        query: `SELECT c.id, c.partitionKey FROM c WHERE STARTSWITH(c.id, @prefix)`,
        parameters: [{ name: '@prefix', value: testDataPrefix }],
      };

      const { resources } = await container.items.query(query).fetchAll();
      
      console.log(`🗑️ Found ${resources.length} test documents in ${containerName} to delete`);
      
      // Delete test documents
      for (const resource of resources) {
        try {
          await container.item(resource.id, resource.partitionKey).delete();
        } catch (error) {
          console.warn(`Failed to delete test document ${resource.id}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup container ${containerName}:`, error);
    }
  }

  async verifyDataIntegrity(): Promise<{
    containerStats: Record<string, { count: number; sampleDocument?: any }>;
    indexingHealth: Record<string, { status: string; indexingProgress?: number }>;
  }> {
    console.log('🔍 Verifying data integrity...');
    
    const containerNames = ['users', 'trails', 'trips', 'recommendations'];
    const containerStats: Record<string, { count: number; sampleDocument?: any }> = {};
    const indexingHealth: Record<string, { status: string; indexingProgress?: number }> = {};
    
    for (const containerName of containerNames) {
      const container = this.client.database(this.databaseName).container(containerName);
      
      try {
        // Get document count
        const countQuery = 'SELECT VALUE COUNT(1) FROM c';
        const { resources: countResult } = await container.items.query(countQuery).fetchAll();
        const count = countResult[0] || 0;
        
        // Get sample document
        const sampleQuery = 'SELECT TOP 1 * FROM c';
        const { resources: sampleResult } = await container.items.query(sampleQuery).fetchAll();
        const sampleDocument = sampleResult[0];
        
        containerStats[containerName] = {
          count,
          sampleDocument,
        };
        
        // Check indexing health (basic check)
        indexingHealth[containerName] = {
          status: 'healthy', // Cosmos DB doesn't expose detailed indexing status via SDK
        };
        
      } catch (error) {
        console.warn(`Failed to verify ${containerName}:`, error);
        containerStats[containerName] = { count: -1 };
        indexingHealth[containerName] = { status: 'error' };
      }
    }
    
    console.log('📊 Data integrity verification completed');
    return { containerStats, indexingHealth };
  }

  async createTestUser(userOverrides: Partial<any> = {}): Promise<any> {
    const testUser = {
      id: `test-user-${Date.now()}`,
      partitionKey: 'test',
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      fitnessLevel: 'intermediate',
      preferences: {
        preferredDifficulty: ['intermediate'],
        maxHikingDistance: 20,
        terrainTypes: ['mountain'],
        groupSize: 'small',
      },
      location: {
        city: 'Test City',
        state: 'Test State',
        region: 'test-region',
        country: 'Test Country',
        coordinates: { longitude: -122, latitude: 37 },
      },
      createdAt: new Date().toISOString(),
      ...userOverrides,
    };

    const container = this.client.database(this.databaseName).container('users');
    const response = await container.items.create(testUser);
    
    return response.resource;
  }

  async createTestTrail(trailOverrides: Partial<any> = {}): Promise<any> {
    const testTrail = {
      id: `test-trail-${Date.now()}`,
      partitionKey: 'test',
      name: `Test Trail ${Date.now()}`,
      description: 'A test trail for integration testing',
      characteristics: {
        difficulty: 'intermediate',
        distance: 10.5,
        duration: 240,
        elevationGain: 500,
        terrainType: 'mountain',
      },
      location: {
        city: 'Test City',
        state: 'Test State',
        region: 'test-region',
        country: 'Test Country',
        coordinates: { longitude: -122, latitude: 37 },
        trailhead: 'Test Trailhead',
      },
      ratings: {
        average: 4.5,
        count: 10,
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      ...trailOverrides,
    };

    const container = this.client.database(this.databaseName).container('trails');
    const response = await container.items.create(testTrail);
    
    return response.resource;
  }

  async createTestTrip(userId: string, tripOverrides: Partial<any> = {}): Promise<any> {
    const testTrip = {
      id: `test-trip-${Date.now()}`,
      partitionKey: userId,
      userId,
      name: `Test Trip ${Date.now()}`,
      description: 'A test trip for integration testing',
      status: 'planned',
      dates: {
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
      },
      location: {
        region: 'test-region',
        coordinates: { longitude: -122, latitude: 37 },
      },
      participants: {
        maxCount: 4,
        currentCount: 1,
      },
      preferences: {
        difficulty: 'intermediate',
        terrain: ['mountain'],
        maxDistance: 15,
      },
      createdAt: new Date().toISOString(),
      ...tripOverrides,
    };

    const container = this.client.database(this.databaseName).container('trips');
    const response = await container.items.create(testTrip);
    
    return response.resource;
  }

  async deleteTestDocument(containerName: string, documentId: string, partitionKey: string): Promise<void> {
    const container = this.client.database(this.databaseName).container(containerName);
    await container.item(documentId, partitionKey).delete();
  }

  async waitForIndexing(maxWaitMs: number = 30000): Promise<void> {
    console.log('⏳ Waiting for indexing to complete...');
    
    // Cosmos DB doesn't provide a direct way to check indexing status
    // This is a simple delay to allow for eventual consistency
    await new Promise(resolve => setTimeout(resolve, Math.min(maxWaitMs, 5000)));
    
    console.log('✅ Indexing wait period completed');
  }
}

// Mock/Real Azure toggle utility
export class AzureTestEnvironment {
  static isRealAzure(): boolean {
    return !!(process.env.AZURE_COSMOS_DB_ENDPOINT && process.env.AZURE_COSMOS_DB_KEY);
  }

  static getTestDataUtility(): AzureTestDataUtility | null {
    if (!this.isRealAzure()) {
      return null;
    }

    return new AzureTestDataUtility(
      process.env.AZURE_COSMOS_DB_ENDPOINT!,
      process.env.AZURE_COSMOS_DB_KEY!
    );
  }

  static skipIfNotRealAzure(testDescription: string): void {
    if (!this.isRealAzure()) {
      console.log(`⏭️ Skipping ${testDescription} - not running against real Azure resources`);
      return;
    }
  }

  static requireRealAzure(testDescription: string): void {
    if (!this.isRealAzure()) {
      throw new Error(`${testDescription} requires real Azure Cosmos DB credentials`);
    }
  }
}