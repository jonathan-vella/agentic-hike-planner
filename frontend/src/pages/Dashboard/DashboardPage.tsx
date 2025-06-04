import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const stats = {
    totalTrips: 3,
    completedTrips: 1,
    upcomingTrips: 2,
    totalDistance: 24.5,
  };

  const recentTrips = [
    {
      id: '1',
      title: 'Mount Washington Adventure',
      date: '2024-07-15',
      status: 'upcoming',
      distance: 8.2,
    },
    {
      id: '2', 
      title: 'Blue Ridge Trail',
      date: '2024-06-20',
      status: 'completed',
      distance: 12.1,
    },
    {
      id: '3',
      title: 'Cascade Falls Hike',
      date: '2024-08-01',
      status: 'upcoming', 
      distance: 4.2,
    },
  ];

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
            <div className="text-2xl font-bold text-primary">{stats.totalTrips}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingTrips}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalDistance}</div>
            <div className="text-sm text-gray-600">Miles Hiked</div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Trips</h2>
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{trip.title}</h3>
                  <p className="text-sm text-gray-600">{trip.date} • {trip.distance} miles</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    trip.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            ))}
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