import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '../../components/ui';
import { tripService, userService } from '../../services';

export const DashboardPage: React.FC = () => {
  // Fetch user trips
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripService.getUserTrips(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user statistics  
  const { data: userStats } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => userService.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate stats from trips data
  const stats = {
    totalTrips: trips.length,
    completedTrips: trips.filter(trip => trip.status === 'completed').length,
    upcomingTrips: trips.filter(trip => trip.status === 'planned' || trip.status === 'draft').length,
    totalDistance: userStats?.totalDistance || trips.reduce((sum, trip) => sum + (trip.trails.reduce((trailSum, trail) => trailSum + trail.distance, 0)), 0),
  };

  // Get recent trips (last 5, sorted by creation date)
  const recentTrips = trips
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(trip => ({
      id: trip.id,
      title: trip.title,
      date: trip.startDate,
      status: trip.status,
      distance: trip.trails.reduce((sum, trail) => sum + trail.distance, 0),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Hiking Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your adventures.</p>
        </div>
        <Link to="/app/trips">
          <Button>Plan New Trip</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {tripsLoading ? '...' : stats.totalTrips}
            </div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tripsLoading ? '...' : stats.completedTrips}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tripsLoading ? '...' : stats.upcomingTrips}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tripsLoading ? '...' : stats.totalDistance.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Miles Hiked</div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Trips</h2>
          <div className="space-y-4">
            {tripsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-2 text-sm">Loading trips...</p>
              </div>
            ) : recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{trip.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(trip.date).toLocaleDateString()} • {trip.distance.toFixed(1)} miles
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trip.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : trip.status === 'planned'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">No trips yet. Start planning your first adventure!</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/app/trips" className="text-primary hover:text-primary/80 text-sm font-medium">
              View all trips →
            </Link>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/app/trips" className="block">
              <div className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Plan New Trip</h3>
                  <p className="text-sm text-gray-600">Create a new hiking adventure</p>
                </div>
              </div>
            </Link>
            
            <Link to="/app/trails" className="block">
              <div className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Discover Trails</h3>
                  <p className="text-sm text-gray-600">Find new hiking trails</p>
                </div>
              </div>
            </Link>

            <Link to="/app/profile" className="block">
              <div className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 bg-green-600/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Update Profile</h3>
                  <p className="text-sm text-gray-600">Manage your preferences</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* AI Assistant Preview */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Hiking Assistant</h2>
            <p className="text-gray-600">Get personalized recommendations and advice for your next adventure.</p>
          </div>
          <Button variant="outline">
            Start Chat
          </Button>
        </div>
      </Card>
    </div>
  );
};