import { BaseDocument } from './Common';

// AI Recommendation Model
export interface AIRecommendation extends BaseDocument {
  userId: string;
  tripId: string;
  trailIds: string[];
  reasoning: string;
  confidence: number; // 0-1 scale
  factors: RecommendationFactors;
  alternatives: RecommendationAlternative[];
  expiresAt: Date;
}

export interface RecommendationFactors {
  fitnessMatch: number; // 0-1 scale
  preferenceAlignment: number; // 0-1 scale
  seasonalSuitability: number; // 0-1 scale
  safetyConsiderations: number; // 0-1 scale
}

export interface RecommendationAlternative {
  trailId: string;
  reason: string;
  confidence: number; // 0-1 scale
}

// Request/Response types
export interface GenerateRecommendationRequest {
  userId: string;
  tripId: string;
  preferences: {
    difficulty: string[];
    maxDistance: number;
    duration: { min: number; max: number };
    features?: string[];
  };
  location: {
    coordinates: [number, number];
    radius: number;
  };
}

export interface RecommendationResponse {
  recommendations: AIRecommendation[];
  totalCount: number;
  generatedAt: Date;
}

// AI Processing types
export interface AIContext {
  userProfile: {
    fitnessLevel: string;
    experience: string[];
    preferences: Record<string, any>;
  };
  tripRequirements: {
    dates: { start: Date; end: Date };
    participants: number;
    preferences: Record<string, any>;
  };
  availableTrails: {
    id: string;
    characteristics: Record<string, any>;
    location: Record<string, any>;
  }[];
  weatherData?: {
    forecast: Record<string, any>;
    seasonal: Record<string, any>;
  };
}

export interface AIRecommendationEngine {
  generateRecommendations(context: AIContext): Promise<AIRecommendation[]>;
  explainRecommendation(recommendationId: string): Promise<string>;
  updateRecommendation(recommendationId: string, feedback: RecommendationFeedback): Promise<AIRecommendation>;
}

export interface RecommendationFeedback {
  rating: number; // 1-5 scale
  useful: boolean;
  issues?: string[];
  selectedTrail?: string;
}