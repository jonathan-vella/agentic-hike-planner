import { apiClient } from './apiClient';
import type { Trail, TrailFilters } from '../types';

export const trailService = {
  async searchTrails(filters: TrailFilters): Promise<Trail[]> {
    try {
      const { data } = await apiClient.get('/trails', { params: filters });
      return data.trails || [];
    } catch (error) {
      console.error('Failed to search trails:', error);
      // Return mock data for now
      return [
        {
          id: '1',
          name: 'Mount Washington Summit Trail',
          description: 'A challenging hike to the summit of Mount Washington with spectacular views',
          difficulty: 'hard',
          distance: 8.2,
          elevation: 4300,
          duration: 6,
          location: {
            latitude: 44.2706,
            longitude: -71.3033,
            address: 'Mount Washington State Park',
            city: 'Gorham',
            state: 'NH',
            country: 'USA',
          },
          images: ['/api/placeholder/300/200'],
          features: ['Summit Views', 'Alpine Lakes', 'Challenging'],
          rating: 4.8,
          reviewCount: 324,
        },
        {
          id: '2',
          name: 'Blue Ridge Parkway Trail',
          description: 'Scenic mountain trail with beautiful wildflowers and waterfalls',
          difficulty: 'moderate',
          distance: 5.7,
          elevation: 1200,
          duration: 3,
          location: {
            latitude: 36.4767,
            longitude: -81.8084,
            address: 'Blue Ridge Parkway',
            city: 'Boone',
            state: 'NC',
            country: 'USA',
          },
          images: ['/api/placeholder/300/200'],
          features: ['Scenic Views', 'Wildflowers', 'Waterfalls'],
          rating: 4.5,
          reviewCount: 156,
        },
        {
          id: '3',
          name: 'Cascade Falls Loop',
          description: 'Easy family-friendly trail leading to beautiful waterfalls',
          difficulty: 'easy',
          distance: 2.4,
          elevation: 400,
          duration: 1.5,
          location: {
            latitude: 38.7223,
            longitude: -78.3542,
            address: 'Shenandoah National Park',
            city: 'Luray',
            state: 'VA',
            country: 'USA',
          },
          images: ['/api/placeholder/300/200'],
          features: ['Waterfalls', 'Family Friendly', 'Short Distance'],
          rating: 4.2,
          reviewCount: 89,
        },
      ];
    }
  },

  async getTrailById(id: string): Promise<Trail | null> {
    try {
      const { data } = await apiClient.get(`/trails/${id}`);
      return data.trail;
    } catch (error) {
      console.error('Failed to fetch trail:', error);
      return null;
    }
  },
};