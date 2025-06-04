// Core user types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  maxDistance?: number;
  preferredTerrains: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Trip planning types
export interface TripPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  trails: Trail[];
  participants: string[];
  status: 'draft' | 'planned' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  trailIds: string[];
}

// Trail types  
export interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  distance: number;
  elevation: number;
  duration: number;
  location: Location;
  images: string[];
  features: string[];
  rating: number;
  reviewCount: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface TrailFilters {
  difficulty?: 'easy' | 'moderate' | 'hard';
  maxDistance?: number;
  maxDuration?: number;
  location?: string;
  features?: string[];
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  type?: 'text' | 'suggestion' | 'error';
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}