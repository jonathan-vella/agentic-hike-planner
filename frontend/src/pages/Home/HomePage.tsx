import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="glass border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-gray-900">Agentic Hike Planner</h1>
                <p className="text-sm text-gray-600">AI-Powered Adventure Planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/app">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link to="/app">
                <Button variant="primary" size="md" icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 hero-bg mountain-silhouette overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-blue-50/50"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-gray-900 mb-8 leading-tight">
              Plan Your Perfect
              <span className="block text-gradient animate-float">Hiking Adventure</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover breathtaking trails, get AI-powered recommendations, and create unforgettable outdoor experiences. 
              Your next adventure begins here.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              <Link to="/app/trips">
                <Button size="xl" className="w-full sm:w-auto shadow-2xl" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }>
                  Start Planning
                </Button>
              </Link>
              <Link to="/app/trails">
                <Button variant="outline" size="xl" className="w-full sm:w-auto" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }>
                  Explore Trails
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold font-display text-gray-900 mb-6">
              Everything You Need for Your 
              <span className="text-gradient block">Hiking Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent planning to real-time guidance, we've built the ultimate hiking companion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hover className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">AI-Powered Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent assistant analyzes your preferences, fitness level, and experience to recommend perfect hiking adventures tailored just for you.
              </p>
            </Card>
            
            <Card hover className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Trail Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore thousands of carefully curated trails with detailed descriptions, stunning photos, difficulty ratings, and real hiker reviews.
              </p>
            </Card>
            
            <Card hover className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Safety First</h3>
              <p className="text-gray-600 leading-relaxed">
                Get real-time weather updates, safety alerts, emergency contacts, and personalized gear recommendations for every adventure.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold font-display mb-2">10K+</div>
              <div className="text-primary-100 text-lg">Curated Trails</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold font-display mb-2">50K+</div>
              <div className="text-primary-100 text-lg">Happy Hikers</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold font-display mb-2">100K+</div>
              <div className="text-primary-100 text-lg">Trips Planned</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold font-display mb-2">25+</div>
              <div className="text-primary-100 text-lg">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-gray-900 mb-6">
            Ready for Your Next 
            <span className="text-gradient">Adventure?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join thousands of outdoor enthusiasts who trust us to plan their perfect hiking experiences.
          </p>
          <Link to="/app">
            <Button size="xl" className="shadow-2xl" icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }>
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold font-display">Agentic Hike Planner</span>
          </div>
          <p className="text-gray-400 mb-6">Powered by Azure AI • Built for Adventure</p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500">© 2025 Agentic Hike Planner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};