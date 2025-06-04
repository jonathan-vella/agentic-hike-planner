import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { TrailRepository } from '../repositories/TrailRepository';
import { DatabaseService } from '../services/database';
import type { TrailSearchFilters, TrailSearchRequest, DifficultyLevel } from '../types';

export class TrailsController {
  private trailRepository: TrailRepository | null = null;
  private databaseService: DatabaseService;

  constructor() {
    // Initialize database service and repository
    this.databaseService = new DatabaseService(false); // Use real Azure database
    this.initializeRepository();
  }

  private async initializeRepository(): Promise<void> {
    try {
      await this.databaseService.initialize();
      const trailsContainer = this.databaseService.getContainer('trails');
      this.trailRepository = new TrailRepository(trailsContainer);
    } catch (error) {
      console.error('Failed to initialize trail repository:', error);
      throw error;
    }
  }

  // Search trails with filters
  public searchTrails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { location, difficulty, maxDistance, limit = 20, offset = 0 } = req.query;

    console.log('Search trails request received:', { location, difficulty, maxDistance, limit, offset });

    // Ensure repository is initialized
    if (!this.trailRepository) {
      await this.initializeRepository();
    }

    // Build search request object for the repository
    const searchRequest: TrailSearchRequest = {
      query: location && typeof location === 'string' && location.trim() ? location.trim() : undefined,
      filters: {},
      sortBy: 'rating',
      sortOrder: 'desc',
      limit: parseInt(limit as string, 10) || 20,
      offset: parseInt(offset as string, 10) || 0,
    };

    // Build filters
    if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
      searchRequest.filters!.difficulty = [difficulty as DifficultyLevel];
      console.log('Applied difficulty filter:', difficulty, 'as array:', searchRequest.filters!.difficulty);
    }
    
    if (maxDistance && typeof maxDistance === 'string') {
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist)) {
        searchRequest.filters!.distance = { min: 0, max: maxDist };
      }
    }

    try {
      // Use repository to search trails in Azure Cosmos DB
      const result = await this.trailRepository!.searchTrails(searchRequest);
      
      res.status(200).json({
        trails: result.trails,
        pagination: {
          total: result.total,
          limit: searchRequest.limit,
          offset: searchRequest.offset,
          hasMore: result.hasMore,
        },
        message: 'Trails retrieved successfully',
      });
    } catch (error) {
      console.error('Error searching trails:', error);
      res.status(500).json({
        error: {
          message: 'Failed to search trails',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // Get trail details by ID  
  public getTrailById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Ensure repository is initialized
    if (!this.trailRepository) {
      await this.initializeRepository();
    }

    try {
      const trail = await this.trailRepository!.findById(id, id); // Using id as partitionKey for simplicity

      if (!trail) {
        res.status(404).json({
          error: {
            message: 'Trail not found',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      res.status(200).json({
        trail,
        message: 'Trail retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting trail by ID:', error);
      res.status(500).json({
        error: {
          message: 'Failed to retrieve trail',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // Get trail recommendations
  public getRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { difficulty, location, experienceLevel } = req.query;

    // Ensure repository is initialized
    if (!this.trailRepository) {
      await this.initializeRepository();
    }

    try {
      // Build search request for recommendations
      const searchRequest: TrailSearchRequest = {
        filters: {},
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: 10,
        offset: 0,
      };

      // Apply filters based on query parameters
      if (difficulty && typeof difficulty === 'string') {
        searchRequest.filters!.difficulty = [difficulty as DifficultyLevel];
      }

      if (experienceLevel === 'beginner') {
        searchRequest.filters!.difficulty = ['beginner'];
        searchRequest.filters!.distance = { min: 0, max: 5 };
      }

      // Get recommended trails from database
      const result = await this.trailRepository!.searchTrails(searchRequest);
      
      // Limit to top 5 recommendations
      const recommendations = result.trails.slice(0, 5);

      res.status(200).json({
        recommendations,
        message: 'Trail recommendations retrieved successfully',
        meta: {
          algorithm: 'database-v1',
          criteria: { difficulty, location, experienceLevel },
          total: result.total,
        },
      });
    } catch (error) {
      console.error('Error getting trail recommendations:', error);
      res.status(500).json({
        error: {
          message: 'Failed to get trail recommendations',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
}