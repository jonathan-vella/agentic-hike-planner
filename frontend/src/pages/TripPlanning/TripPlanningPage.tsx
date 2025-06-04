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

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating trip:', formData);
    alert('Trip created successfully! (This is a mock implementation)');
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mountain-dawn via-forest-light to-sky-light">
      <div className="px-6 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent animate-slide-up">
            Plan Your Adventure
          </h1>
          <p className="text-gray-600 mt-3 text-lg animate-slide-up [animation-delay:0.1s]">
            Create a personalized hiking trip with our AI-powered planning tools
          </p>
          <div className="mt-4 flex justify-center animate-slide-up [animation-delay:0.2s]">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up [animation-delay:0.3s]">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                  ${step <= currentStep 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-400 backdrop-blur-sm border border-gray-200'
                  }
                `}>
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < totalSteps && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded-full transition-all duration-300
                    ${step < currentStep ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Preferences</span>
            <span>AI Planning</span>
            <span>Review</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Trip Form */}
            <div className="lg:col-span-2">
              <Card glass className="animate-slide-up [animation-delay:0.4s]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Trip Title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Mount Washington Adventure"
                          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300"
                          >
                            <option value="easy">🟢 Easy - Beginner friendly</option>
                            <option value="moderate">🟡 Moderate - Some experience needed</option>
                            <option value="hard">🔴 Hard - Expert level</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Trip Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300 resize-none"
                          placeholder="Describe your ideal hiking adventure... What do you hope to see and experience?"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Start Date"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                          required
                        />
                        
                        <Input
                          label="End Date"
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
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
                        className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                      />
                    </div>
                  )}

                  {/* Step 2: Preferences */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Your Preferences</h2>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: 'Waterfalls', icon: '💧' },
                          { name: 'Mountain Views', icon: '🏔️' },
                          { name: 'Wildlife', icon: '🦌' },
                          { name: 'Photography', icon: '📸' },
                          { name: 'Solitude', icon: '🧘' },
                          { name: 'Historical Sites', icon: '🏛️' },
                        ].map((interest) => (
                          <div key={interest.name} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-primary-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary-200 hover:shadow-lg">
                            <div className="text-2xl mb-2">{interest.icon}</div>
                            <div className="text-sm font-medium text-gray-700">{interest.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: AI Planning */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Planning</h2>
                      </div>
                      
                      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-gray-800">Our AI is analyzing trails for you...</p>
                        <p className="text-gray-600 mt-2">Finding the perfect matches based on your preferences</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                          4
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Review & Create</h2>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">Trip: {formData.title}</h3>
                          <p className="text-gray-600">{formData.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Duration:</span> {formData.startDate} to {formData.endDate}
                          </div>
                          <div>
                            <span className="font-medium">Difficulty:</span> {formData.difficulty}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex space-x-3">
                      <Button type="button" variant="ghost">
                        Save as Draft
                      </Button>
                      
                      {currentStep === totalSteps ? (
                        <Button type="submit" className="shadow-lg hover:shadow-xl">
                          Create Trip
                        </Button>
                      ) : (
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="shadow-lg hover:shadow-xl"
                        >
                          Next Step
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 animate-slide-up [animation-delay:0.5s]">
              
              {/* AI Assistant */}
              <Card glass>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-400 to-accent-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">🌟</span>
                      <div>
                        <p className="text-sm font-medium text-primary-800">Pro Tip</p>
                        <p className="text-xs text-primary-700 mt-1">
                          Spring hiking requires extra preparation for muddy trails and temperature swings.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-100">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">📊</span>
                      <div>
                        <p className="text-sm font-medium text-secondary-800">Weather Insight</p>
                        <p className="text-xs text-secondary-700 mt-1">
                          Perfect conditions expected for your dates. 70°F and sunny!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-accent-50 to-secondary-50 rounded-xl border border-accent-100">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">🎒</span>
                      <div>
                        <p className="text-sm font-medium text-accent-800">Gear Reminder</p>
                        <p className="text-xs text-accent-700 mt-1">
                          Don't forget your hiking poles and extra water for this difficulty level.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card glass>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Planning Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-semibold text-primary-700">{Math.round((currentStep / totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-primary-700">2.4k</div>
                      <div className="text-xs text-gray-600">Available Trails</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-accent-700">94%</div>
                      <div className="text-xs text-gray-600">Match Rate</div>
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};