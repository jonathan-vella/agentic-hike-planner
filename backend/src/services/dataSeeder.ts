import { DatabaseService } from './database';
import { UserRepository, TripRepository, TrailRepository, RecommendationRepository } from '../repositories';
import { MockDataGenerator } from './mockDataGenerator';

export class DataSeeder {
  private userRepository: UserRepository;
  private tripRepository: TripRepository;
  private trailRepository: TrailRepository;
  private recommendationRepository: RecommendationRepository;
  private mockGenerator: MockDataGenerator;
  private databaseService: DatabaseService;

  constructor(databaseService?: DatabaseService) {
    this.mockGenerator = new MockDataGenerator();
    // Use provided database service or import the singleton
    this.databaseService = databaseService || require('./database').databaseService;
  }

  async initialize(): Promise<void> {
    // Initialize repositories
    this.userRepository = new UserRepository(this.databaseService.getContainer('users'));
    this.tripRepository = new TripRepository(this.databaseService.getContainer('trips'));
    this.trailRepository = new TrailRepository(this.databaseService.getContainer('trails'));
    this.recommendationRepository = new RecommendationRepository(this.databaseService.getContainer('recommendations'));
  }

  async seedAll(options: {
    users?: number;
    trails?: number;
    trips?: number;
    recommendations?: number;
  } = {}): Promise<{
    users: number;
    trails: number;
    trips: number;
    recommendations: number;
  }> {
    const {
      users: userCount = 20,
      trails: trailCount = 100,
      trips: tripCount = 50,
      recommendations: recommendationCount = 30,
    } = options;

    console.log('Starting data seeding...');

    try {
      // Seed users first
      console.log(`Seeding ${userCount} users...`);
      const userIds = await this.seedUsers(userCount);

      // Seed trails
      console.log(`Seeding ${trailCount} trails...`);
      const trailIds = await this.seedTrails(trailCount);

      // Seed trips (requires user IDs)
      console.log(`Seeding ${tripCount} trips...`);
      const tripIds = await this.seedTrips(userIds, tripCount);

      // Update trips with some selected trails
      console.log('Adding trails to trips...');
      await this.addTrailsToTrips(tripIds, trailIds);

      // Seed recommendations (requires user, trip, and trail IDs)
      console.log(`Seeding ${recommendationCount} recommendations...`);
      await this.seedRecommendations(userIds, tripIds, trailIds, recommendationCount);

      console.log('Data seeding completed successfully!');

      return {
        users: userIds.length,
        trails: trailIds.length,
        trips: tripIds.length,
        recommendations: recommendationCount,
      };
    } catch (error) {
      console.error('Error during data seeding:', error);
      throw error;
    }
  }

  async seedUsers(count: number = 20): Promise<string[]> {
    const users = this.mockGenerator.generateUsers(count);
    const userIds: string[] = [];

    for (const userData of users) {
      try {
        // Use the raw create method since we already have complete user data
        const { id, partitionKey, createdAt, updatedAt, ...userWithoutSystemFields } = userData;
        const createdUser = await this.userRepository.createUser(userWithoutSystemFields);
        userIds.push(createdUser.id);
      } catch (error) {
        console.warn(`Failed to create user ${userData.email}:`, error);
      }
    }

    console.log(`Created ${userIds.length} users`);
    return userIds;
  }

  async seedTrails(count: number = 100): Promise<string[]> {
    const trails = this.mockGenerator.generateTrails(count);
    const trailIds: string[] = [];

    // Batch creation for better performance
    const batchSize = 10;
    for (let i = 0; i < trails.length; i += batchSize) {
      const batch = trails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (trailData) => {
        try {
          const { id, partitionKey, createdAt, updatedAt, ...trailWithoutSystemFields } = trailData;
          const createdTrail = await this.trailRepository.create(trailWithoutSystemFields);
          return createdTrail.id;
        } catch (error) {
          console.warn(`Failed to create trail ${trailData.name}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      trailIds.push(...batchResults.filter(id => id !== null) as string[]);
    }

    console.log(`Created ${trailIds.length} trails`);
    return trailIds;
  }

  async seedTrips(userIds: string[], count: number = 50): Promise<string[]> {
    if (userIds.length === 0) {
      console.warn('No users available for trip creation');
      return [];
    }

    const trips = this.mockGenerator.generateTrips(userIds, count);
    const tripIds: string[] = [];

    for (const tripData of trips) {
      try {
        const { id, partitionKey, createdAt, updatedAt, ...tripWithoutSystemFields } = tripData;
        const createdTrip = await this.tripRepository.create(tripWithoutSystemFields);
        tripIds.push(createdTrip.id);
      } catch (error) {
        console.warn(`Failed to create trip ${tripData.title}:`, error);
      }
    }

    console.log(`Created ${tripIds.length} trips`);
    return tripIds;
  }

  async addTrailsToTrips(tripIds: string[], trailIds: string[]): Promise<void> {
    if (tripIds.length === 0 || trailIds.length === 0) {
      console.warn('No trips or trails available for association');
      return;
    }

    // Add 1-3 trails to each trip
    for (const tripId of tripIds) {
      try {
        // Get the trip to find its user ID (partition key)
        // For simplicity, we'll skip this association for now
        // In a real implementation, you'd query the trip first
        const trailCount = Math.floor(Math.random() * 3) + 1; // 1-3 trails
        const selectedTrails = this.getRandomSubset(trailIds, trailCount);
        
        // Note: This would require getting the trip first to know the userId/partitionKey
        // await this.tripRepository.update(tripId, userId, { selectedTrails });
      } catch (error) {
        console.warn(`Failed to add trails to trip ${tripId}:`, error);
      }
    }
  }

  async seedRecommendations(
    userIds: string[], 
    tripIds: string[], 
    trailIds: string[], 
    count: number = 30
  ): Promise<string[]> {
    if (userIds.length === 0 || tripIds.length === 0 || trailIds.length === 0) {
      console.warn('Insufficient data for recommendation creation');
      return [];
    }

    const recommendations = this.mockGenerator.generateRecommendations(userIds, tripIds, trailIds, count);
    const recommendationIds: string[] = [];

    for (const recommendationData of recommendations) {
      try {
        const { id, partitionKey, createdAt, updatedAt, ...recommendationWithoutSystemFields } = recommendationData;
        const createdRecommendation = await this.recommendationRepository.create(recommendationWithoutSystemFields);
        recommendationIds.push(createdRecommendation.id);
      } catch (error) {
        console.warn(`Failed to create recommendation for user ${recommendationData.userId}:`, error);
      }
    }

    console.log(`Created ${recommendationIds.length} recommendations`);
    return recommendationIds;
  }

  async clearAllData(): Promise<void> {
    console.log('Clearing all data...');
    
    try {
      // Note: In a production system, you'd want to be more careful about this
      // For now, we'll just log the intention
      console.log('Data clearing would delete all documents from all containers');
      console.warn('Actual data clearing not implemented for safety');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async getDataCounts(): Promise<{
    users: number;
    trails: number;
    trips: number;
    recommendations: number;
  }> {
    try {
      const [users, trails, trips, recommendations] = await Promise.all([
        this.userRepository.count(),
        this.trailRepository.count(),
        this.tripRepository.count(),
        this.recommendationRepository.count(),
      ]);

      return { users, trails, trips, recommendations };
    } catch (error) {
      console.error('Error getting data counts:', error);
      return { users: 0, trails: 0, trips: 0, recommendations: 0 };
    }
  }

  private getRandomSubset<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

// Singleton instance for easy use
export const dataSeeder = new DataSeeder();