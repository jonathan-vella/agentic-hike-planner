import { BaseDocument, GeoLocation, Coordinates } from './Common';

// User Profile Model
export interface UserProfile extends BaseDocument {
  email: string;
  displayName: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: UserPreferences;
  location: GeoLocation;
  isActive: boolean;
}

export interface UserPreferences {
  preferredDifficulty: DifficultyLevel[];
  maxHikingDistance: number; // km
  terrainTypes: TerrainType[];
  groupSize: 'solo' | 'small' | 'large' | 'any';
}

export interface UserLocation {
  city: string;
  state: string;
  country: string;
  region: string;
  coordinates?: Coordinates; // optional for privacy
  address?: string;
}

// Enums and constants
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TerrainType = 'mountain' | 'forest' | 'desert' | 'coastal' | 'canyon' | 'valley' | 'alpine';

// Request/Response types for API
export interface CreateUserRequest {
  email: string;
  displayName: string;
  fitnessLevel: DifficultyLevel;
  preferences: UserPreferences;
  location: GeoLocation;
}

export interface UpdateUserRequest {
  displayName?: string;
  fitnessLevel?: DifficultyLevel;
  preferences?: Partial<UserPreferences>;
  location?: GeoLocation;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserStatistics {
  totalTrips: number;
  totalDistance: number; // km
  totalElevationGain: number; // meters
  favoriteTrails: string[]; // trail IDs
  completedTrails: number;
}