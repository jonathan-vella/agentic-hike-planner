import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input } from '../../components/ui';
import { trailService } from '../../services';
import type { Trail, TrailFilters } from '../../types';

export const TrailsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all' as 'easy' | 'moderate' | 'hard' | 'all',
    maxDistance: undefined as number | undefined,
    maxDuration: undefined as number | undefined,
    location: '',
    features: [] as string[],
  });

  // Convert UI filters to API filters
  const apiFilters: TrailFilters = {
    difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
    maxDistance: filters.maxDistance,
    maxDuration: filters.maxDuration,
    location: searchQuery || filters.location,
    features: filters.features,
  };

  // Fetch trails from API
  const { 
    data: trails = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['trails', apiFilters],
    queryFn: () => trailService.searchTrails(apiFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trail recommendations
  const { 
    data: recommendations = [] 
  } = useQuery({
    queryKey: ['trail-recommendations'],
    queryFn: () => trailService.getRecommendations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discover Hiking Trails</h1>
        <p className="text-gray-600 mt-1">Find the perfect trail for your next adventure.</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <Input
            placeholder="Search trails by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty || 'all'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  difficulty: e.target.value as 'easy' | 'moderate' | 'hard' | 'all'
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance (miles)
              </label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxDistance || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxDistance: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Duration (hours)
              </label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxDuration || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxDuration: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex items-end">
              <Button variant="outline">
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map(trail => (
              <TrailCard key={`rec-${trail.id}`} trail={trail} />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {isLoading ? 'Searching...' : `Found ${trails.length} trail${trails.length !== 1 ? 's' : ''}`}
        </p>
        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
          <option>Sort by Popularity</option>
          <option>Sort by Distance</option>
          <option>Sort by Difficulty</option>
          <option>Sort by Rating</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading trails...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load trails. Please try again.</p>
        </div>
      )}

      {/* Trail Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trails.map(trail => (
            <TrailCard key={trail.id} trail={trail} />
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && trails.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Trails
          </Button>
        </div>
      )}
    </div>
  );
};

// Extract TrailCard into a separate component for reusability
const TrailCard: React.FC<{ trail: Trail }> = ({ trail }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          {trail.images?.[0] ? (
            <img 
              src={trail.images[0]} 
              alt={trail.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{trail.name}</h3>
          <p className="text-sm text-gray-600">
            {trail.location.city}, {trail.location.state}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trail.difficulty)}`}>
            {trail.difficulty}
          </span>
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-600">{trail.rating} ({trail.reviewCount})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">{trail.distance}</span> mi
          </div>
          <div>
            <span className="font-medium">{trail.elevation}</span> ft
          </div>
          <div>
            <span className="font-medium">{trail.duration}</span> hrs
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {trail.features.slice(0, 3).map(feature => (
            <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {feature}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button size="sm" className="flex-1">
            View Details
          </Button>
          <Button variant="outline" size="sm">
            Add to Trip
          </Button>
        </div>
      </div>
    </Card>
  );
};