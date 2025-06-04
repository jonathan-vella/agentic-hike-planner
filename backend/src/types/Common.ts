// Common types used across the application

export interface BaseDocument {
  id: string;
  partitionKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Location {
  region: string;
  coordinates: Coordinates;
}

export interface GeoLocation extends Location {
  city: string;
  state: string;
  country: string;
  address?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  flexibility?: number; // days of flexibility
}

export interface Range {
  min: number;
  max: number;
}

export interface Budget {
  amount: number;
  currency: string;
  includesAccommodation: boolean;
}

// Pagination and query types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface QueryOptions extends PaginationOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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
  hasPrevious: boolean;
}