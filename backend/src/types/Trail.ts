import { BaseDocument, Coordinates, Range } from './Common';
import { DifficultyLevel } from './User';
import { TrailType } from './Trip';

// Trail Information Model
export interface Trail extends BaseDocument {
  name: string;
  description: string;
  location: TrailLocation;
  characteristics: TrailCharacteristics;
  features: TrailFeatures;
  safety: TrailSafety;
  amenities: TrailAmenities;
  ratings: TrailRatings;
  isActive: boolean;
}

export interface TrailLocation {
  region: string;
  park: string;
  country: string;
  coordinates: TrailCoordinates;
}

export interface TrailCoordinates {
  start: Coordinates;
  end: Coordinates;
  waypoints: Coordinates[];
}

export interface TrailCharacteristics {
  difficulty: DifficultyLevel;
  distance: number; // km
  duration: Range; // hours
  elevationGain: number; // meters
  elevationProfile: number[]; // elevation points
  trailType: TrailType;
  surface: SurfaceType[];
}

export interface TrailFeatures {
  scenicViews: boolean;
  waterFeatures: boolean;
  wildlife: string[];
  seasonality: TrailSeasonality;
}

export interface TrailSeasonality {
  bestMonths: number[]; // 1-12
  accessibleMonths: number[]; // 1-12
}

export interface TrailSafety {
  riskLevel: number; // 1-5 scale
  commonHazards: string[];
  requiresPermit: boolean;
  emergencyContacts: string[];
}

export interface TrailAmenities {
  parking: boolean;
  restrooms: boolean;
  camping: boolean;
  drinkingWater: boolean;
}

export interface TrailRatings {
  average: number;
  count: number;
  breakdown: { [key: number]: number }; // rating -> count
}

// Enums and constants
export type SurfaceType = 'rock' | 'dirt' | 'paved' | 'gravel' | 'sand' | 'snow' | 'stone-steps' | 'boardwalk';

// Search and filter types
export interface TrailSearchFilters {
  difficulty?: DifficultyLevel[];
  distance?: Range;
  duration?: Range;
  elevationGain?: Range;
  location?: {
    coordinates: Coordinates;
    radius: number; // km
  };
  features?: string[];
  amenities?: string[];
  rating?: Range;
  trailType?: TrailType[];
}

export interface TrailSearchRequest {
  query?: string;
  filters?: TrailSearchFilters;
  sortBy?: 'distance' | 'difficulty' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TrailRecommendationRequest {
  userId: string;
  location: Coordinates;
  preferences: {
    difficulty: DifficultyLevel[];
    maxDistance: number;
    duration: Range;
    features?: string[];
  };
  limit?: number;
}

// Response types
export interface TrailSummary {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  distance: number;
  duration: Range;
  location: {
    region: string;
    park: string;
  };
  rating: number;
  images?: string[];
}