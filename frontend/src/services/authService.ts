import { apiClient } from './apiClient';
import type { UserProfile, LoginCredentials } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      // Return mock user for now
      const mockUser: UserProfile = {
        id: 'user123',
        email: credentials.email,
        name: 'John Doe',
        avatar: '/api/placeholder/100/100',
        preferences: {
          difficultyLevel: 'intermediate',
          maxDistance: 10,
          preferredTerrains: ['Mountain', 'Forest'],
        },
      };
      localStorage.setItem('auth-token', 'mock-token-123');
      return mockUser;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth-token');
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data } = await apiClient.get('/auth/me');
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data } = await apiClient.put('/auth/profile', profile);
      return data.user;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
};