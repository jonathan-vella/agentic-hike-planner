import React, { useState } from 'react';
import { Button, Card, Input } from '../../components/ui';

export const TrailsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    maxDistance: '',
    features: [] as string[],
  });

  // Mock trail data
  const trails = [
    {
      id: '1',
      name: 'Mount Washington Summit Trail',
      difficulty: 'hard',
      distance: 8.2,
      elevation: 4300,
      duration: 6,
      rating: 4.8,
      reviewCount: 324,
      location: 'White Mountains, NH',
      features: ['Summit Views', 'Alpine Lakes', 'Challenging'],
      image: '/api/placeholder/300/200'
    },
    {
      id: '2', 
      name: 'Blue Ridge Parkway Trail',
      difficulty: 'moderate',
      distance: 5.7,
      elevation: 1200,
      duration: 3,
      rating: 4.5,
      reviewCount: 156,
      location: 'Blue Ridge Mountains, VA',
      features: ['Scenic Views', 'Wildflowers', 'Waterfalls'],
      image: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Cascade Falls Loop',
      difficulty: 'easy',
      distance: 2.4,
      elevation: 400,
      duration: 1.5,
      rating: 4.2,
      reviewCount: 89,
      location: 'Shenandoah National Park, VA',
      features: ['Waterfalls', 'Family Friendly', 'Short Distance'],
      image: '/api/placeholder/300/200'
    },
    {
      id: '4',
      name: 'Rocky Mountain High Trail',
      difficulty: 'hard',
      distance: 12.1,
      elevation: 3200,
      duration: 8,
      rating: 4.9,
      reviewCount: 201,
      location: 'Rocky Mountain National Park, CO',
      features: ['Alpine Views', 'Wildlife', 'Challenging'],
      image: '/api/placeholder/300/200'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTrails = trails.filter(trail => {
    const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trail.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filters.difficulty === 'all' || trail.difficulty === filters.difficulty;
    const matchesDistance = !filters.maxDistance || trail.distance <= parseFloat(filters.maxDistance);
    
    return matchesSearch && matchesDifficulty && matchesDistance;
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
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
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
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
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

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Found {filteredTrails.length} trail{filteredTrails.length !== 1 ? 's' : ''}
        </p>
        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
          <option>Sort by Popularity</option>
          <option>Sort by Distance</option>
          <option>Sort by Difficulty</option>
          <option>Sort by Rating</option>
        </select>
      </div>

      {/* Trail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrails.map(trail => (
          <Card key={trail.id} className="overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{trail.name}</h3>
                <p className="text-sm text-gray-600">{trail.location}</p>
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
        ))}
      </div>

      {/* Load More */}
      {filteredTrails.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Trails
          </Button>
        </div>
      )}
    </div>
  );
};