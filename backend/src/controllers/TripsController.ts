import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, createError } from '../middleware/errorHandler';

interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data storage (in real app, this would be Azure Cosmos DB)
const mockTrips: Trip[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'mock-user-id',
    name: 'Mount Washington Hike',
    description: 'Challenging hike to the summit of Mount Washington',
    startDate: '2024-07-15T08:00:00Z',
    endDate: '2024-07-15T18:00:00Z',
    difficulty: 'hard',
    location: {
      name: 'Mount Washington, NH',
      latitude: 44.2706,
      longitude: -71.3033,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export class TripsController {
  // Get all trips for authenticated user
  public getAllTrips = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Filter trips by user ID
    const userTrips = mockTrips.filter(trip => trip.userId === userId);

    res.status(200).json({
      trips: userTrips,
      count: userTrips.length,
      message: 'Trips retrieved successfully',
    });
  });

  // Get specific trip by ID
  public getTripById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const trip = mockTrips.find(t => t.id === id && t.userId === userId);

    if (!trip) {
      throw createError('Trip not found', 404);
    }

    res.status(200).json({
      trip,
      message: 'Trip retrieved successfully',
    });
  });

  // Create new trip
  public createTrip = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { name, description, startDate, endDate, difficulty, location } = req.body;

    const newTrip: Trip = {
      id: uuidv4(),
      userId,
      name,
      description,
      startDate,
      endDate,
      difficulty,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In real app, save to Azure Cosmos DB
    mockTrips.push(newTrip);

    res.status(201).json({
      trip: newTrip,
      message: 'Trip created successfully',
    });
  });

  // Update existing trip
  public updateTrip = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const tripIndex = mockTrips.findIndex(t => t.id === id && t.userId === userId);

    if (tripIndex === -1) {
      throw createError('Trip not found', 404);
    }

    const updates = req.body;
    const existingTrip = mockTrips[tripIndex];

    // Update trip with new data
    const updatedTrip: Trip = {
      ...existingTrip,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockTrips[tripIndex] = updatedTrip;

    res.status(200).json({
      trip: updatedTrip,
      message: 'Trip updated successfully',
    });
  });

  // Delete trip
  public deleteTrip = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const tripIndex = mockTrips.findIndex(t => t.id === id && t.userId === userId);

    if (tripIndex === -1) {
      throw createError('Trip not found', 404);
    }

    // Remove trip from mock storage
    mockTrips.splice(tripIndex, 1);

    res.status(200).json({
      message: 'Trip deleted successfully',
    });
  });
}