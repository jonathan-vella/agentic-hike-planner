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
    <div className="min-h-screen bg-gradient-to-br from-mountain-dawn via-forest-light to-sky-light">
      <div className="space-y-8 animate-fade-in px-6 py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent animate-slide-up">
            Discover Hiking Trails
          </h1>
          <p className="text-gray-600 mt-3 text-lg animate-slide-up [animation-delay:0.1s]">
            Find the perfect trail for your next adventure
          </p>
          <div className="mt-4 flex justify-center animate-slide-up [animation-delay:0.2s]">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card glass className="animate-slide-up [animation-delay:0.3s]">
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                placeholder="Search trails by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty || 'all'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    difficulty: e.target.value as 'easy' | 'moderate' | 'hard' | 'all'
                  }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Distance (miles)
                </label>
                <input
                  type="number"
                  placeholder="Any distance"
                  value={filters.maxDistance || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxDistance: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Duration (hours)
                </label>
                <input
                  type="number"
                  placeholder="Any duration"
                  value={filters.maxDuration || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxDuration: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300"
                />
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl">
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="animate-slide-up [animation-delay:0.4s]">
            <div className="flex items-center mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-gray-600">Trails picked just for your preferences</p>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-accent-400 to-secondary-500 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((trail, index) => (
                <div key={`rec-${trail.id}`} className={`animate-slide-up [animation-delay:${0.5 + index * 0.1}s]`}>
                  <TrailCard trail={trail} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center animate-slide-up [animation-delay:0.6s]">
          <div>
            <p className="text-lg font-semibold text-gray-700">
              {isLoading ? 'Searching trails...' : `Found ${trails.length} trail${trails.length !== 1 ? 's' : ''}`}
            </p>
            <p className="text-sm text-gray-500">Discover your next adventure</p>
          </div>
          <select className="px-4 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300">
            <option>Sort by Popularity</option>
            <option>Sort by Distance</option>
            <option>Sort by Difficulty</option>
            <option>Sort by Rating</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 opacity-20 animate-pulse"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Loading amazing trails for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-semibold">Failed to load trails</p>
              <p className="text-red-600 text-sm mt-1">Please check your connection and try again</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Trail Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trails.map((trail, index) => (
              <div key={trail.id} className={`animate-slide-up [animation-delay:${0.7 + index * 0.05}s]`}>
                <TrailCard trail={trail} />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && trails.length > 0 && (
          <div className="text-center animate-slide-up [animation-delay:1s]">
            <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl">
              Load More Trails
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && trails.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold">No trails found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// TrailCard Component
const TrailCard: React.FC<{ trail: Trail }> = ({ trail }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100 border-green-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card glass className="group overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="relative">
        <div className="w-full h-56 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center overflow-hidden">
          {trail.images?.[0] ? (
            <img 
              src={trail.images[0]} 
              alt={trail.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(trail.difficulty)}`}>
            {trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">{trail.rating}</span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
            {trail.name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {trail.location.city}, {trail.location.state}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="text-lg font-bold text-primary-700">{trail.distance}</div>
            <div className="text-xs text-gray-600">miles</div>
          </div>
          <div className="bg-secondary-50 rounded-lg p-3">
            <div className="text-lg font-bold text-secondary-700">{trail.elevation}</div>
            <div className="text-xs text-gray-600">ft gain</div>
          </div>
          <div className="bg-accent-50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent-700">{trail.duration}</div>
            <div className="text-xs text-gray-600">hours</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">
          {trail.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {trail.features?.slice(0, 3).map((feature: string) => (
            <span 
              key={feature}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
          {trail.features && trail.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{trail.features.length - 3} more
            </span>
          )}
        </div>

        <Button className="w-full group-hover:bg-primary-600 transition-colors">
          View Details
        </Button>
      </div>
    </Card>
  );
};