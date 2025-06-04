import { create } from 'zustand';
import { trailService } from '../services/trailService';
import type { Trail, TrailFilters } from '../types';

interface TrailStore {
  trails: Trail[];
  selectedTrail: Trail | null;
  filters: TrailFilters;
  isLoading: boolean;
  error: string | null;
  searchTrails: (filters: TrailFilters) => Promise<Trail[]>;
  setFilters: (filters: TrailFilters) => void;
  selectTrail: (trail: Trail | null) => void;
  clearError: () => void;
}

export const useTrailStore = create<TrailStore>((set) => ({
  trails: [],
  selectedTrail: null,
  filters: {},
  isLoading: false,
  error: null,

  searchTrails: async (filters) => {
    set({ isLoading: true, error: null, filters });
    try {
      const trails = await trailService.searchTrails(filters);
      set({ trails, isLoading: false });
      return trails;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search trails';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  selectTrail: (trail) => {
    set({ selectedTrail: trail });
  },

  clearError: () => {
    set({ error: null });
  },
}));