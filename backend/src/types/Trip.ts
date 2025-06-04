import { BaseDocument, Coordinates, DateRange, Range, Budget } from './Common';
import { DifficultyLevel } from './User';

// Trip Planning Model
export interface TripPlan extends BaseDocument {
  userId: string;
  title: string;
  description: string;
  status: TripStatus;
  dates: DateRange;
  location: TripLocation;
  participants: TripParticipants;
  preferences: TripPreferences;
  selectedTrails: string[]; // trail IDs
  equipment: string[];
  budget: Budget;
}

export interface TripLocation {
  region: string;
  coordinates: Coordinates;
  radius: number; // km radius for trail search
}

export interface TripParticipants {
  count: number;
  fitnessLevels: DifficultyLevel[];
  specialRequirements: string[];
}

export interface TripPreferences {
  difficulty: DifficultyLevel[];
  duration: Range; // hours
  distance: Range; // km
  elevationGain: Range; // meters
  trailTypes: TrailType[];
}

// Enums and constants
export type TripStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';
export type TrailType = 'loop' | 'out-and-back' | 'point-to-point' | 'shuttle';

// Request/Response types for API
export interface CreateTripRequest {
  title: string;
  description: string;
  dates: DateRange;
  location: TripLocation;
  participants: TripParticipants;
  preferences: TripPreferences;
  budget?: Budget;
}

export interface UpdateTripRequest {
  title?: string;
  description?: string;
  status?: TripStatus;
  dates?: DateRange;
  location?: TripLocation;
  participants?: TripParticipants;
  preferences?: Partial<TripPreferences>;
  selectedTrails?: string[];
  equipment?: string[];
  budget?: Budget;
}

export interface TripSummary {
  id: string;
  title: string;
  status: TripStatus;
  dates: DateRange;
  trailCount: number;
  participantCount: number;
}