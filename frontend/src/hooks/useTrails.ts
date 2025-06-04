import { useQuery } from '@tanstack/react-query';
import { trailService } from '../services/trailService';
import type { TrailFilters } from '../types';

export const useTrails = (filters: TrailFilters = {}) => {
  return useQuery({
    queryKey: ['trails', filters],
    queryFn: () => trailService.searchTrails(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: Object.keys(filters).length > 0 || !filters.location, // Always enabled for initial load
  });
};

export const useTrail = (id: string) => {
  return useQuery({
    queryKey: ['trail', id],
    queryFn: () => trailService.getTrailById(id),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
  });
};