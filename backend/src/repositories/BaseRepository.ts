import { Container, SqlQuerySpec } from '@azure/cosmos';
import { v4 as uuid } from 'uuid';

export abstract class BaseRepository<T extends { id: string; partitionKey: string }> {
  protected container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  async create(document: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const newDocument = {
      ...document,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    try {
      const { resource } = await this.container.items.create(newDocument);
      return resource as T;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string, partitionKey: string): Promise<T | null> {
    try {
      const { resource } = await this.container.item(id, partitionKey).read<T>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      console.error('Error finding document by ID:', error);
      throw new Error(`Failed to find document: ${error.message}`);
    }
  }

  async update(id: string, partitionKey: string, updates: Partial<T>): Promise<T> {
    try {
      const existing = await this.findById(id, partitionKey);
      if (!existing) {
        throw new Error('Document not found');
      }

      const updatedDocument = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };

      const { resource } = await this.container.item(id, partitionKey).replace(updatedDocument);
      return resource as T;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string, partitionKey: string): Promise<void> {
    try {
      await this.container.item(id, partitionKey).delete();
    } catch (error: any) {
      if (error.code === 404) {
        throw new Error('Document not found');
      }
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  protected async query(querySpec: SqlQuerySpec, partitionKey?: string): Promise<T[]> {
    try {
      const queryOptions = partitionKey ? { partitionKey } : {};
      const { resources } = await this.container.items.query<T>(querySpec, queryOptions).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected async queryWithPagination(
    querySpec: SqlQuerySpec,
    maxItemCount: number = 20,
    continuationToken?: string,
    partitionKey?: string
  ): Promise<{ items: T[]; continuationToken?: string; hasMore: boolean }> {
    try {
      const queryOptions = {
        maxItemCount,
        continuationToken,
        ...(partitionKey && { partitionKey }),
      };

      const queryIterator = this.container.items.query<T>(querySpec, queryOptions);
      const { resources, continuationToken: nextToken } = await queryIterator.fetchNext();

      return {
        items: resources,
        continuationToken: nextToken,
        hasMore: !!nextToken,
      };
    } catch (error) {
      console.error('Error executing paginated query:', error);
      throw new Error(`Failed to execute paginated query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string, partitionKey: string): Promise<boolean> {
    try {
      const document = await this.findById(id, partitionKey);
      return document !== null;
    } catch (error) {
      return false;
    }
  }

  async count(whereClause?: string, parameters?: any[]): Promise<number> {
    try {
      let query = 'SELECT VALUE COUNT(1) FROM c';
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }

      const querySpec: SqlQuerySpec = {
        query,
        parameters: parameters || [],
      };

      const { resources } = await this.container.items.query<number>(querySpec).fetchAll();
      return resources[0] || 0;
    } catch (error) {
      console.error('Error counting documents:', error);
      throw new Error(`Failed to count documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}