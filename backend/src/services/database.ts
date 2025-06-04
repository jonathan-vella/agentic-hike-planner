import { CosmosClient, Database, Container, ContainerDefinition } from '@azure/cosmos';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { config } from '../config';

export class DatabaseService {
  private client: CosmosClient | null = null;
  private database: Database | null = null;
  private containers: Map<string, Container> = new Map();
  private isTestMode: boolean = false;

  constructor(testMode: boolean = false) {
    this.isTestMode = testMode;
    
    if (!testMode) {
      if (!config.azure.cosmosDb.endpoint) {
        throw new Error('Azure Cosmos DB endpoint is required');
      }

      // Try different authentication methods
      if (config.azure.cosmosDb.key) {
        // Use access key authentication
        this.client = new CosmosClient({
          endpoint: config.azure.cosmosDb.endpoint,
          key: config.azure.cosmosDb.key,
        });
      } else {
        // Use Azure AD authentication with DefaultAzureCredential
        try {
          const credential = new DefaultAzureCredential();
          this.client = new CosmosClient({
            endpoint: config.azure.cosmosDb.endpoint,
            aadCredentials: credential,
          });
        } catch (error) {
          throw new Error('Azure Cosmos DB authentication failed. Ensure either access key is provided or Azure AD authentication is configured.');
        }
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.isTestMode) {
      console.log('Database service running in test mode - skipping actual initialization');
      return;
    }

    try {
      // Create database
      const { database } = await this.client!.databases.createIfNotExists({
        id: 'HikePlannerDB',
      });
      this.database = database;

      // Setup containers
      await this.setupContainers();

      console.log('Database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  private async setupContainers(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const containerDefinitions: ContainerDefinition[] = [
      {
        id: 'users',
        partitionKey: { paths: ['/partitionKey'] },
        indexingPolicy: {
          includedPaths: [
            { path: '/email/?' },
            { path: '/fitnessLevel/?' },
            { path: '/location/region/?' },
            { path: '/createdAt/?' },
          ],
          excludedPaths: [{ path: '/*' }],
        },
      },
      {
        id: 'trips',
        partitionKey: { paths: ['/partitionKey'] },
        indexingPolicy: {
          includedPaths: [
            { path: '/userId/?' },
            { path: '/status/?' },
            { path: '/dates/startDate/?' },
            { path: '/dates/endDate/?' },
            { path: '/location/region/?' },
            { path: '/createdAt/?' },
          ],
          excludedPaths: [{ path: '/*' }],
        },
      },
      {
        id: 'trails',
        partitionKey: { paths: ['/partitionKey'] },
        indexingPolicy: {
          includedPaths: [
            { path: '/characteristics/difficulty/?' },
            { path: '/characteristics/distance/?' },
            { path: '/characteristics/duration/?' },
            { path: '/location/region/?' },
            { path: '/location/country/?' },
            { path: '/ratings/average/?' },
            { path: '/isActive/?' },
          ],
          excludedPaths: [{ path: '/*' }],
        },
      },
      {
        id: 'recommendations',
        partitionKey: { paths: ['/partitionKey'] },
        indexingPolicy: {
          includedPaths: [
            { path: '/userId/?' },
            { path: '/tripId/?' },
            { path: '/confidence/?' },
            { path: '/createdAt/?' },
            { path: '/expiresAt/?' },
          ],
          excludedPaths: [{ path: '/*' }],
        },
        defaultTtl: 30 * 24 * 60 * 60, // 30 days TTL for recommendations
      },
    ];

    for (const containerDef of containerDefinitions) {
      try {
        const { container } = await this.database.containers.createIfNotExists(containerDef);
        this.containers.set(containerDef.id, container);
        console.log(`Container '${containerDef.id}' initialized`);
      } catch (error) {
        console.error(`Failed to create container '${containerDef.id}':`, error);
        throw error;
      }
    }
  }

  getContainer(containerName: string): Container {
    if (this.isTestMode) {
      // Return a mock container for testing
      return {} as Container;
    }
    
    const container = this.containers.get(containerName);
    if (!container) {
      throw new Error(`Container '${containerName}' not found. Make sure database is initialized.`);
    }
    return container;
  }

  async healthCheck(): Promise<{ status: string; database: string; authenticationType?: string }> {
    try {
      if (this.isTestMode) {
        return {
          status: 'healthy (test mode)',
          database: 'test',
          authenticationType: 'test',
        };
      }

      if (!this.database) {
        throw new Error('Database not initialized');
      }

      // Simple read operation to check connectivity
      await this.database.read();
      
      // Determine authentication type
      const authenticationType = config.azure.cosmosDb.key ? 'access-key' : 'azure-ad';
      
      return {
        status: 'healthy',
        database: this.database.id,
        authenticationType,
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        database: 'unknown',
        authenticationType: 'unknown',
      };
    }
  }

  async close(): Promise<void> {
    // Cosmos DB client doesn't require explicit closing
    // This method is here for consistency and future use
    console.log('Database service closed');
  }
}

// Singleton instance - only create if we have credentials
let databaseService: DatabaseService;
try {
  databaseService = new DatabaseService();
} catch (error) {
  // If no credentials, create a test instance
  console.warn('No database credentials found, using test mode');
  databaseService = new DatabaseService(true);
}

// Test instance for testing without credentials
export const testDatabaseService = new DatabaseService(true);

export { databaseService };