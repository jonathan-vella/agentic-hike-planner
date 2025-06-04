import { apiClient } from './apiClient';
import type { Trail, TrailFilters } from '../types';

export const trailService = {
  async searchTrails(filters: TrailFilters): Promise<Trail[]> {
    try {
      console.log('Calling API with filters:', filters);
      const { data } = await apiClient.get('/trails/search', { params: filters });
      console.log('API response:', data);
      
      // Backend returns { trails: Trail[], pagination: {}, message: '' }
      if (data.trails && Array.isArray(data.trails)) {
        return data.trails;
      } else {
        console.warn('Unexpected API response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Failed to search trails:', error);
      console.log('Falling back to empty array due to error');
      return [];
    }
  },

  async getTrailById(id: string): Promise<Trail | null> {
    try {
      console.log('Calling trail by ID API:', id);
      const { data } = await apiClient.get(`/trails/${id}`);
      console.log('Trail by ID API response:', data);
      
      // Backend returns { trail: Trail, message: '' }
      if (data.trail) {
        return data.trail;
      } else {
        console.warn('Unexpected trail by ID API response structure:', data);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch trail:', error);
      return null;
    }
  },

  async getRecommendations(): Promise<Trail[]> {
    try {
      console.log('Calling recommendations API');
      const { data } = await apiClient.get('/trails/recommendations');
      console.log('Recommendations API response:', data);
      
      // Backend returns { recommendations: Trail[], message: '', meta: {} }
      if (data.recommendations && Array.isArray(data.recommendations)) {
        return data.recommendations;
      } else {
        console.warn('Unexpected recommendations API response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch trail recommendations:', error);
      return [];
    }
  },
};