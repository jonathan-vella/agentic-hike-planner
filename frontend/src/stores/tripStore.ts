import { create } from 'zustand';
import { tripService } from '../services/tripService';
import type { TripPlan, CreateTripRequest } from '../types';

interface TripStore {
  currentTrip: TripPlan | null;
  trips: TripPlan[];
  isLoading: boolean;
  error: string | null;
  createTrip: (trip: CreateTripRequest) => Promise<TripPlan>;
  updateTrip: (id: string, updates: Partial<TripPlan>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  loadTrips: () => Promise<void>;
  setCurrentTrip: (trip: TripPlan | null) => void;
  clearError: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  currentTrip: null,
  trips: [],
  isLoading: false,
  error: null,

  createTrip: async (tripData) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await tripService.createTrip(tripData);
      set(state => ({
        trips: [...state.trips, trip],
        currentTrip: trip,
        isLoading: false,
      }));
      return trip;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTrip: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTrip = await tripService.updateTrip(id, updates);
      set(state => ({
        trips: state.trips.map(trip => trip.id === id ? updatedTrip : trip),
        currentTrip: state.currentTrip?.id === id ? updatedTrip : state.currentTrip,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTrip: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tripService.deleteTrip(id);
      set(state => ({
        trips: state.trips.filter(trip => trip.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  loadTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await tripService.getUserTrips();
      set({ trips, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trips';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setCurrentTrip: (trip) => {
    set({ currentTrip: trip });
  },

  clearError: () => {
    set({ error: null });
  },
}));