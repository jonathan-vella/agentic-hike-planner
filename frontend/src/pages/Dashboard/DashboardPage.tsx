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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-gray-900 mb-2">Your Adventure Hub</h1>
          <p className="text-lg text-gray-600">Welcome back, John! Ready for your next hiking adventure?</p>
        </div>
        <Link to="/app/trips">
          <Button size="lg" icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="text-center group">
          <div className="h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="text-3xl font-bold font-display text-gray-900 mb-1">
            {tripsLoading ? '...' : stats.totalTrips}
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Trips</div>
        </Card>
        
        <Card hover className="text-center group">
          <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-3xl font-bold font-display text-gray-900 mb-1">
            {tripsLoading ? '...' : stats.completedTrips}
          </div>
          <div className="text-sm text-gray-600 font-medium">Completed</div>
        </Card>
        
        <Card hover className="text-center group">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold font-display text-gray-900 mb-1">
            {tripsLoading ? '...' : stats.upcomingTrips}
          </div>
          <div className="text-sm text-gray-600 font-medium">Upcoming</div>
        </Card>
        
        <Card hover className="text-center group">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-3xl font-bold font-display text-gray-900 mb-1">
            {tripsLoading ? '...' : stats.totalDistance.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 font-medium">Miles Hiked</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-gray-900">Recent Adventures</h2>
            <Link to="/app/trips">
              <Button variant="ghost" size="sm" icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }>
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {tripsLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 bg-primary-200 rounded-full animate-pulse mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading your adventures...</p>
              </div>
            ) : recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <div key={trip.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{trip.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(trip.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {trip.distance.toFixed(1)} miles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      trip.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : trip.status === 'planned'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">No adventures yet. Time to start exploring!</p>
                <Link to="/app/trips">
                  <Button>Plan Your First Trip</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/app/trips" className="block group">
                <div className="flex items-center p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-all duration-300 group-hover:scale-105">
                  <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-600 transition-colors">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Plan New Trip</h3>
                    <p className="text-sm text-gray-600">Create a new adventure</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/app/trails" className="block group">
                <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group-hover:scale-105">
                  <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-600 transition-colors">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Discover Trails</h3>
                    <p className="text-sm text-gray-600">Find new hiking trails</p>
                  </div>
                </div>
              </Link>

              <Link to="/app/profile" className="block group">
                <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group-hover:scale-105">
                  <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-600 transition-colors">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Update Profile</h3>
                    <p className="text-sm text-gray-600">Manage preferences</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* AI Assistant */}
          <Card glass>
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-display text-gray-900 mb-2">AI Hiking Assistant</h3>
              <p className="text-sm text-gray-600 mb-4">Get personalized recommendations for your next adventure</p>
              <Button variant="outline" size="sm" className="w-full">
                Start Chat
              </Button>
            </div>
          </Card>
        </div>
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