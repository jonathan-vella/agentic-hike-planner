import { Container, SqlQuerySpec } from '@azure/cosmos';
import { BaseRepository } from './BaseRepository';
import { UserProfile, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserRepository extends BaseRepository<UserProfile> {
  constructor(container: Container) {
    super(container);
  }

  async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    const userDocument = {
      ...userData,
      partitionKey: '', // Will be set to userId after creation
      isActive: true,
    };

    const createdUser = await super.create(userDocument as Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>);
    
    // Update partition key to be the user ID
    return await this.update(createdUser.id, createdUser.id, {
      partitionKey: createdUser.id,
    });
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email AND c.isActive = true',
      parameters: [{ name: '@email', value: email }],
    };

    const users = await this.query(querySpec);
    return users.length > 0 ? users[0] : null;
  }

  async findActiveUsers(limit: number = 50, continuationToken?: string): Promise<{
    users: UserProfile[];
    continuationToken?: string;
    hasMore: boolean;
  }> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.isActive = true ORDER BY c.createdAt DESC',
    };

    const result = await this.queryWithPagination(querySpec, limit, continuationToken);
    
    return {
      users: result.items,
      continuationToken: result.continuationToken,
      hasMore: result.hasMore,
    };
  }

  async findByFitnessLevel(fitnessLevel: string): Promise<UserProfile[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.fitnessLevel = @fitnessLevel AND c.isActive = true',
      parameters: [{ name: '@fitnessLevel', value: fitnessLevel }],
    };

    return await this.query(querySpec);
  }

  async findByLocation(region: string, limit: number = 20): Promise<UserProfile[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.location.region = @region AND c.isActive = true',
      parameters: [{ name: '@region', value: region }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async updateProfile(userId: string, updates: UpdateUserRequest): Promise<UserProfile> {
    return await this.update(userId, userId, updates as Partial<UserProfile>);
  }

  async deactivateUser(userId: string): Promise<UserProfile> {
    return await this.update(userId, userId, { isActive: false });
  }

  async reactivateUser(userId: string): Promise<UserProfile> {
    return await this.update(userId, userId, { isActive: true });
  }

  async getUserStats(userId: string): Promise<{
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
  } | null> {
    try {
      // This would typically join with trips container, but for now we'll return basic info
      const user = await this.findById(userId, userId);
      if (!user) {
        return null;
      }

      // In a real implementation, this would query the trips container
      // For now, return placeholder data
      return {
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string, limit: number = 20): Promise<UserProfile[]> {
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.isActive = true 
        AND (
          CONTAINS(LOWER(c.displayName), LOWER(@searchTerm)) 
          OR CONTAINS(LOWER(c.location.city), LOWER(@searchTerm))
          OR CONTAINS(LOWER(c.location.region), LOWER(@searchTerm))
        )
        ORDER BY c.displayName
      `,
      parameters: [{ name: '@searchTerm', value: searchTerm }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findUsersWithPreferences(preferences: {
    fitnessLevel?: string[];
    terrainTypes?: string[];
    maxDistance?: number;
  }): Promise<UserProfile[]> {
    let whereConditions: string[] = ['c.isActive = true'];
    const parameters: any[] = [];

    if (preferences.fitnessLevel && preferences.fitnessLevel.length > 0) {
      whereConditions.push('c.fitnessLevel IN (@fitnessLevels)');
      parameters.push({ name: '@fitnessLevels', value: preferences.fitnessLevel });
    }

    if (preferences.maxDistance) {
      whereConditions.push('c.preferences.maxHikingDistance >= @maxDistance');
      parameters.push({ name: '@maxDistance', value: preferences.maxDistance });
    }

    const querySpec: SqlQuerySpec = {
      query: `SELECT * FROM c WHERE ${whereConditions.join(' AND ')} ORDER BY c.createdAt DESC`,
      parameters,
    };

    return await this.query(querySpec);
  }
}