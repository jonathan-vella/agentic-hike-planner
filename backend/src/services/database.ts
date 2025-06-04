import { CosmosClient, Database, Container, ContainerDefinition } from '@azure/cosmos';
import { config } from '../config';

export class DatabaseService {
  private client: CosmosClient;
  private database: Database | null = null;
  private containers: Map<string, Container> = new Map();

  constructor() {
    if (!config.azure.cosmosDb.endpoint || !config.azure.cosmosDb.key) {
      throw new Error('Azure Cosmos DB configuration is missing');
    }

    this.client = new CosmosClient({
      endpoint: config.azure.cosmosDb.endpoint,
      key: config.azure.cosmosDb.key,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Create database
      const { database } = await this.client.databases.createIfNotExists({
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
    const container = this.containers.get(containerName);
    if (!container) {
      throw new Error(`Container '${containerName}' not found. Make sure database is initialized.`);
    }
    return container;
  }

  async healthCheck(): Promise<{ status: string; database: string }> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      // Simple read operation to check connectivity
      await this.database.read();
      
      return {
        status: 'healthy',
        database: this.database.id,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'unknown',
      };
    }
  }

  async close(): Promise<void> {
    // Cosmos DB client doesn't require explicit closing
    // This method is here for consistency and future use
    console.log('Database service closed');
  }
}

// Singleton instance
export const databaseService = new DatabaseService();