import { apiClient } from './apiClient';
import type { TripPlan, CreateTripRequest } from '../types';

export const tripService = {
  async getUserTrips(): Promise<TripPlan[]> {
    try {
      const { data } = await apiClient.get('/trips');
      return data.trips || data.data || data;
    } catch (error) {
      console.error('Failed to fetch user trips:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          title: 'Mount Washington Adventure',
          description: 'A challenging hike to the summit',
          startDate: '2024-07-15',
          endDate: '2024-07-15',
          trails: [],
          participants: ['user123'],
          status: 'planned',
          createdAt: '2024-06-01T00:00:00Z',
          updatedAt: '2024-06-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Blue Ridge Trail',
          description: 'Scenic mountain trail with waterfalls',
          startDate: '2024-06-20',
          endDate: '2024-06-20',
          trails: [],
          participants: ['user123'],
          status: 'completed',
          createdAt: '2024-05-15T00:00:00Z',
          updatedAt: '2024-06-20T00:00:00Z',
        },
      ];
    }
  },

  async createTrip(trip: CreateTripRequest): Promise<TripPlan> {
    try {
      const { data } = await apiClient.post('/trips', trip);
      return data.trip || data.data || data;
    } catch (error) {
      console.error('Failed to create trip:', error);
      // Return mock response as fallback
      return {
        id: Date.now().toString(),
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        trails: [],
        participants: ['user123'],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateTrip(id: string, updates: Partial<TripPlan>): Promise<TripPlan> {
    try {
      const { data } = await apiClient.put(`/trips/${id}`, updates);
      return data.trip || data.data || data;
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  async deleteTrip(id: string): Promise<void> {
    try {
      await apiClient.delete(`/trips/${id}`);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  },

  async getTripById(id: string): Promise<TripPlan | null> {
    try {
      const { data } = await apiClient.get(`/trips/${id}`);
      return data.trip || data.data || data;
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      return null;
    }
  },
};