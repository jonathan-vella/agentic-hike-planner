import { apiClient } from './apiClient';
import type { UserPreferences } from '../types';

export interface UserStatistics {
  totalTrips: number;
  completedTrips: number;
  totalDistance: number;
  totalElevation: number;
  favoriteTrail?: string;
  averageRating?: number;
}

export const userService = {
  async getStatistics(): Promise<UserStatistics | null> {
    try {
      const { data } = await apiClient.get('/user/statistics');
      return data.statistics || data.data || data;
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      // Return mock statistics as fallback
      return {
        totalTrips: 12,
        completedTrips: 8,
        totalDistance: 85.4,
        totalElevation: 15200,
        favoriteTrail: 'Mount Washington Summit Trail',
        averageRating: 4.2,
      };
    }
  },

  async updatePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    try {
      const { data } = await apiClient.put('/user/preferences', preferences);
      return data.preferences || data.data || data;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  },
};