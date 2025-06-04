import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { UserProfile, LoginCredentials } from '../types';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signOut: () => void; // Alias for logout to match chat interface
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const user = await authService.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
      },

      signOut: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (profile) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const updatedUser = await authService.updateProfile(profile);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Profile update error:', error);
          throw error;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth-token');
        
        // In development, auto-login with mock user if no token
        if (!token && import.meta.env.DEV) {
          const mockUser: UserProfile = {
            id: 'mock-user-id',
            email: 'user@example.com',
            name: 'Mock User',
            avatar: '/api/placeholder/100/100',
            preferences: {
              difficultyLevel: 'intermediate',
              maxDistance: 10,
              preferredTerrains: ['Mountain', 'Forest'],
            },
          };
          localStorage.setItem('auth-token', 'mock-valid-token');
          set({ user: mockUser, isAuthenticated: true });
          return;
        }
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          if (user) {
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);