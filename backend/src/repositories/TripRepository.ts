import { Container, SqlQuerySpec } from '@azure/cosmos';
import { BaseRepository } from './BaseRepository';
import { TripPlan, CreateTripRequest, UpdateTripRequest, TripStatus } from '../types';

export class TripRepository extends BaseRepository<TripPlan> {
  constructor(container: Container) {
    super(container);
  }

  async create(tripData: CreateTripRequest & { userId: string }): Promise<TripPlan> {
    const tripDocument = {
      ...tripData,
      partitionKey: tripData.userId,
      status: 'planning' as TripStatus,
      selectedTrails: [],
      equipment: [],
      budget: tripData.budget || {
        amount: 0,
        currency: 'USD',
        includesAccommodation: false,
      },
    };

    return await super.create(tripDocument);
  }

  async findByUserId(userId: string, limit: number = 20, continuationToken?: string): Promise<{
    trips: TripPlan[];
    continuationToken?: string;
    hasMore: boolean;
  }> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }],
    };

    const result = await this.queryWithPagination(querySpec, limit, continuationToken, userId);
    
    return {
      trips: result.items,
      continuationToken: result.continuationToken,
      hasMore: result.hasMore,
    };
  }

  async findByStatus(status: TripStatus, limit: number = 50): Promise<TripPlan[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.status = @status ORDER BY c.createdAt DESC',
      parameters: [{ name: '@status', value: status }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findByUserIdAndStatus(userId: string, status: TripStatus): Promise<TripPlan[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = @status ORDER BY c.createdAt DESC',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@status', value: status },
      ],
    };

    return await this.query(querySpec, userId);
  }

  async findUpcomingTrips(userId: string, daysAhead: number = 30): Promise<TripPlan[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND c.dates.startDate >= @startDate 
        AND c.dates.startDate <= @endDate
        AND c.status IN (@confirmedStatus, @planningStatus)
        ORDER BY c.dates.startDate ASC
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@startDate', value: startDate.toISOString() },
        { name: '@endDate', value: endDate.toISOString() },
        { name: '@confirmedStatus', value: 'confirmed' },
        { name: '@planningStatus', value: 'planning' },
      ],
    };

    return await this.query(querySpec, userId);
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 50): Promise<TripPlan[]> {
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.dates.startDate <= @endDate 
        AND c.dates.endDate >= @startDate
        ORDER BY c.dates.startDate ASC
      `,
      parameters: [
        { name: '@startDate', value: startDate.toISOString() },
        { name: '@endDate', value: endDate.toISOString() },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findByLocation(region: string, radiusKm?: number, limit: number = 20): Promise<TripPlan[]> {
    let query = 'SELECT * FROM c WHERE c.location.region = @region';
    const parameters: any[] = [{ name: '@region', value: region }];

    if (radiusKm) {
      // For simplicity, we'll use region matching. In a real implementation,
      // you'd use geospatial queries with ST_DISTANCE
      query += ' AND c.location.radius <= @radius';
      parameters.push({ name: '@radius', value: radiusKm });
    }

    query += ' ORDER BY c.createdAt DESC';

    const querySpec: SqlQuerySpec = {
      query,
      parameters,
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async updateTrip(tripId: string, userId: string, updates: UpdateTripRequest): Promise<TripPlan> {
    return await this.update(tripId, userId, updates as Partial<TripPlan>);
  }

  async updateStatus(tripId: string, userId: string, status: TripStatus): Promise<TripPlan> {
    return await this.update(tripId, userId, { status });
  }

  async addTrailToTrip(tripId: string, userId: string, trailId: string): Promise<TripPlan> {
    const trip = await this.findById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const updatedTrails = [...new Set([...trip.selectedTrails, trailId])];
    return await this.update(tripId, userId, { selectedTrails: updatedTrails });
  }

  async removeTrailFromTrip(tripId: string, userId: string, trailId: string): Promise<TripPlan> {
    const trip = await this.findById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const updatedTrails = trip.selectedTrails.filter(id => id !== trailId);
    return await this.update(tripId, userId, { selectedTrails: updatedTrails });
  }

  async getUserTripStats(userId: string): Promise<{
    total: number;
    byStatus: Record<TripStatus, number>;
    upcoming: number;
    thisYear: number;
  }> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const now = new Date();

    // Get all user trips
    const allTripsQuery: SqlQuerySpec = {
      query: 'SELECT c.status, c.dates FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: userId }],
    };

    const trips = await this.query(allTripsQuery, userId);
    
    const stats = {
      total: trips.length,
      byStatus: {
        planning: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      } as Record<TripStatus, number>,
      upcoming: 0,
      thisYear: 0,
    };

    trips.forEach(trip => {
      // Count by status
      stats.byStatus[trip.status as TripStatus]++;

      // Count upcoming trips
      const startDate = new Date(trip.dates.startDate);
      if (startDate > now && (trip.status === 'planning' || trip.status === 'confirmed')) {
        stats.upcoming++;
      }

      // Count this year's trips
      if (startDate >= yearStart) {
        stats.thisYear++;
      }
    });

    return stats;
  }

  async searchTrips(userId: string, searchTerm: string, limit: number = 20): Promise<TripPlan[]> {
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND (
          CONTAINS(LOWER(c.title), LOWER(@searchTerm))
          OR CONTAINS(LOWER(c.description), LOWER(@searchTerm))
          OR CONTAINS(LOWER(c.location.region), LOWER(@searchTerm))
        )
        ORDER BY c.createdAt DESC
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@searchTerm', value: searchTerm },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit, undefined, userId);
    return result.items;
  }
}