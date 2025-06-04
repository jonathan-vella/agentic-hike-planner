import { Container, SqlQuerySpec } from '@azure/cosmos';
import { BaseRepository } from './BaseRepository';
import { Trail, TrailSearchFilters, TrailSearchRequest, DifficultyLevel } from '../types';

export class TrailRepository extends BaseRepository<Trail> {
  constructor(container: Container) {
    super(container);
  }

  async create(trailData: Omit<Trail, 'id' | 'partitionKey' | 'createdAt' | 'updatedAt'>): Promise<Trail> {
    const trailDocument = {
      ...trailData,
      partitionKey: trailData.location.region,
      isActive: true,
    };

    return await super.create(trailDocument);
  }

  async findByRegion(region: string, limit: number = 20, continuationToken?: string): Promise<{
    trails: Trail[];
    continuationToken?: string;
    hasMore: boolean;
  }> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.location.region = @region AND c.isActive = true ORDER BY c.ratings.average DESC',
      parameters: [{ name: '@region', value: region }],
    };

    const result = await this.queryWithPagination(querySpec, limit, continuationToken, region);
    
    return {
      trails: result.items,
      continuationToken: result.continuationToken,
      hasMore: result.hasMore,
    };
  }

  async findByDifficulty(difficulty: DifficultyLevel, limit: number = 20): Promise<Trail[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.characteristics.difficulty = @difficulty AND c.isActive = true ORDER BY c.ratings.average DESC',
      parameters: [{ name: '@difficulty', value: difficulty }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async searchTrails(searchRequest: TrailSearchRequest): Promise<{
    trails: Trail[];
    total: number;
    hasMore: boolean;
  }> {
    const { query: searchQuery, filters, sortBy = 'rating', sortOrder = 'desc', limit = 20, offset = 0 } = searchRequest;

    let whereConditions: string[] = ['c.isActive = true'];
    const parameters: any[] = [];

    // Text search
    if (searchQuery) {
      whereConditions.push(`(
        CONTAINS(LOWER(c.name), LOWER(@searchQuery))
        OR CONTAINS(LOWER(c.description), LOWER(@searchQuery))
        OR CONTAINS(LOWER(c.location.park), LOWER(@searchQuery))
        OR CONTAINS(LOWER(c.location.region), LOWER(@searchQuery))
      )`);
      parameters.push({ name: '@searchQuery', value: searchQuery });
    }

    // Apply filters
    if (filters) {
      this.applyFiltersToQuery(filters, whereConditions, parameters);
    }

    // Build sort clause
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
    case 'distance':
      orderBy += `c.characteristics.distance ${sortOrder.toUpperCase()}`;
      break;
    case 'difficulty':
      orderBy += `c.characteristics.difficulty ${sortOrder.toUpperCase()}`;
      break;
    case 'popularity':
      orderBy += `c.ratings.count ${sortOrder.toUpperCase()}`;
      break;
    case 'rating':
    default:
      orderBy += `c.ratings.average ${sortOrder.toUpperCase()}`;
      break;
    }

    // Count query for total
    const countQuerySpec: SqlQuerySpec = {
      query: `SELECT VALUE COUNT(1) FROM c WHERE ${whereConditions.join(' AND ')}`,
      parameters,
    };

    // Main query with pagination
    const querySpec: SqlQuerySpec = {
      query: `SELECT * FROM c WHERE ${whereConditions.join(' AND ')} ${orderBy} OFFSET ${offset} LIMIT ${limit}`,
      parameters,
    };

    console.log('Executing Cosmos DB query:', querySpec);

    try {
      const [countResult, searchResult] = await Promise.all([
        this.container.items.query<number>(countQuerySpec).fetchAll(),
        this.container.items.query<Trail>(querySpec).fetchAll(),
      ]);

      const total = countResult.resources[0] || 0;
      const trails = searchResult.resources;

      return {
        trails,
        total,
        hasMore: offset + trails.length < total,
      };
    } catch (error) {
      console.error('Error searching trails:', error);
      throw new Error(`Failed to search trails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private applyFiltersToQuery(filters: TrailSearchFilters, whereConditions: string[], parameters: any[]): void {
    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      console.log('Applying difficulty filter:', filters.difficulty);
      
      if (filters.difficulty.length === 1) {
        // Single difficulty value
        whereConditions.push('c.characteristics.difficulty = @difficulty');
        parameters.push({ name: '@difficulty', value: filters.difficulty[0] });
      } else {
        // Multiple difficulty values - build OR conditions
        const difficultyConditions = filters.difficulty.map((_, index) => {
          const paramName = `@difficulty${index}`;
          parameters.push({ name: paramName, value: filters.difficulty[index] });
          return `c.characteristics.difficulty = ${paramName}`;
        });
        whereConditions.push(`(${difficultyConditions.join(' OR ')})`);
      }
      
      console.log('Added difficulty WHERE condition and parameters:', { whereConditions, parameters });
    }

    // Distance filter
    if (filters.distance) {
      if (filters.distance.min !== undefined) {
        whereConditions.push('c.characteristics.distance >= @minDistance');
        parameters.push({ name: '@minDistance', value: filters.distance.min });
      }
      if (filters.distance.max !== undefined) {
        whereConditions.push('c.characteristics.distance <= @maxDistance');
        parameters.push({ name: '@maxDistance', value: filters.distance.max });
      }
    }

    // Duration filter
    if (filters.duration) {
      if (filters.duration.min !== undefined) {
        whereConditions.push('c.characteristics.duration.min >= @minDuration');
        parameters.push({ name: '@minDuration', value: filters.duration.min });
      }
      if (filters.duration.max !== undefined) {
        whereConditions.push('c.characteristics.duration.max <= @maxDuration');
        parameters.push({ name: '@maxDuration', value: filters.duration.max });
      }
    }

    // Elevation gain filter
    if (filters.elevationGain) {
      if (filters.elevationGain.min !== undefined) {
        whereConditions.push('c.characteristics.elevationGain >= @minElevation');
        parameters.push({ name: '@minElevation', value: filters.elevationGain.min });
      }
      if (filters.elevationGain.max !== undefined) {
        whereConditions.push('c.characteristics.elevationGain <= @maxElevation');
        parameters.push({ name: '@maxElevation', value: filters.elevationGain.max });
      }
    }

    // Location filter (geospatial - simplified)
    if (filters.location) {
      // In a real implementation, you'd use ST_DISTANCE for proper geospatial queries
      // For now, we'll use a simple region-based approach
      whereConditions.push('c.location.region = @locationRegion');
      parameters.push({ name: '@locationRegion', value: 'nearby-region' }); // Placeholder
    }

    // Rating filter
    if (filters.rating) {
      if (filters.rating.min !== undefined) {
        whereConditions.push('c.ratings.average >= @minRating');
        parameters.push({ name: '@minRating', value: filters.rating.min });
      }
      if (filters.rating.max !== undefined) {
        whereConditions.push('c.ratings.average <= @maxRating');
        parameters.push({ name: '@maxRating', value: filters.rating.max });
      }
    }

    // Trail type filter
    if (filters.trailType && filters.trailType.length > 0) {
      whereConditions.push('c.characteristics.trailType IN (@trailTypes)');
      parameters.push({ name: '@trailTypes', value: filters.trailType });
    }

    // Features filter
    if (filters.features && filters.features.length > 0) {
      // This is a simplified implementation - in reality you'd check for specific features
      whereConditions.push('c.features.scenicViews = true OR c.features.waterFeatures = true');
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      // Simplified amenities check
      whereConditions.push('c.amenities.parking = true OR c.amenities.restrooms = true');
    }
  }

  async findTopRatedTrails(limit: number = 10, region?: string): Promise<Trail[]> {
    let query = 'SELECT * FROM c WHERE c.isActive = true AND c.ratings.count > 5';
    const parameters: any[] = [];

    if (region) {
      query += ' AND c.location.region = @region';
      parameters.push({ name: '@region', value: region });
    }

    query += ' ORDER BY c.ratings.average DESC';

    const querySpec: SqlQuerySpec = { query, parameters };
    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findTrailsByPark(park: string, limit: number = 20): Promise<Trail[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.location.park = @park AND c.isActive = true ORDER BY c.ratings.average DESC',
      parameters: [{ name: '@park', value: park }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findRecommendedTrails(
    userFitnessLevel: DifficultyLevel,
    maxDistance: number,
    preferredFeatures: string[] = [],
    region?: string,
    limit: number = 10
  ): Promise<Trail[]> {
    let whereConditions: string[] = [
      'c.isActive = true',
      'c.characteristics.difficulty = @difficulty',
      'c.characteristics.distance <= @maxDistance',
    ];

    const parameters: any[] = [
      { name: '@difficulty', value: userFitnessLevel },
      { name: '@maxDistance', value: maxDistance },
    ];

    if (region) {
      whereConditions.push('c.location.region = @region');
      parameters.push({ name: '@region', value: region });
    }

    const querySpec: SqlQuerySpec = {
      query: `SELECT * FROM c WHERE ${whereConditions.join(' AND ')} ORDER BY c.ratings.average DESC`,
      parameters,
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async updateTrailRating(trailId: string, region: string, newRating: number): Promise<Trail> {
    const trail = await this.findById(trailId, region);
    if (!trail) {
      throw new Error('Trail not found');
    }

    // Calculate new average (simplified - in real implementation you'd store individual ratings)
    const currentAvg = trail.ratings.average;
    const currentCount = trail.ratings.count;
    const newCount = currentCount + 1;
    const newAverage = ((currentAvg * currentCount) + newRating) / newCount;

    const updatedRatings = {
      ...trail.ratings,
      average: Math.round(newAverage * 100) / 100, // Round to 2 decimal places
      count: newCount,
    };

    return await this.update(trailId, region, { ratings: updatedRatings });
  }

  async deactivateTrail(trailId: string, region: string): Promise<Trail> {
    return await this.update(trailId, region, { isActive: false });
  }

  async reactivateTrail(trailId: string, region: string): Promise<Trail> {
    return await this.update(trailId, region, { isActive: true });
  }
}