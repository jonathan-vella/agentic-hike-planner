import React, { useState } from 'react';
import { Button, Card, Input } from '../../components/ui';

export const TripPlanningPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    difficulty: 'moderate',
    maxDistance: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock trip creation
    console.log('Creating trip:', formData);
    alert('Trip created successfully! (This is a mock implementation)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plan Your Hiking Trip</h1>
        <p className="text-gray-600 mt-1">Create a new hiking adventure with our AI-powered planning tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Trip Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Mount Washington Adventure"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Describe your hiking trip..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Input
                  label="Maximum Distance (miles)"
                  name="maxDistance"
                  type="number"
                  value={formData.maxDistance}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  helperText="Leave empty for no distance limit"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit">
                  Find Trails
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Suggestions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Based on the season, consider bringing extra layers for temperature changes.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🌤️ Weather looks perfect this weekend for hiking!
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Some trails may require permits. Check local requirements.
                </p>
              </div>
            </div>
          </Card>

          {/* Planning Checklist */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Planning Checklist</h3>
            <div className="space-y-2">
              {[
                'Choose your trails',
                'Check weather conditions',
                'Plan your gear',
                'Notify emergency contacts',
                'Download offline maps',
                'Check park regulations'
              ].map((item, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Recent Trips */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Recent Trips</h3>
            <div className="space-y-2">
              <div className="p-2 border border-gray-100 rounded cursor-pointer hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900">Mount Washington</p>
                <p className="text-xs text-gray-600">June 2024 • 8.2 miles</p>
              </div>
              <div className="p-2 border border-gray-100 rounded cursor-pointer hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900">Blue Ridge Trail</p>
                <p className="text-xs text-gray-600">May 2024 • 12.1 miles</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};