import React from 'react';
import { Button, Card, Input } from '../../components/ui';

export const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mountain-dawn via-forest-light to-sky-light">
      <div className="px-6 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent animate-slide-up">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-3 text-lg animate-slide-up [animation-delay:0.1s]">
            Manage your account and hiking preferences
          </p>
          <div className="mt-4 flex justify-center animate-slide-up [animation-delay:0.2s]">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card glass className="animate-slide-up [animation-delay:0.3s]">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                </div>
                
                <form className="space-y-6">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <div className="h-24 w-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl">
                        Change Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="First Name" 
                      defaultValue="John" 
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    />
                    <Input 
                      label="Last Name" 
                      defaultValue="Doe" 
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    />
                  </div>

                  <Input 
                    label="Email" 
                    type="email" 
                    defaultValue="john.doe@example.com" 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Phone" 
                      type="tel" 
                      defaultValue="+1 (555) 123-4567" 
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    />
                    <Input 
                      label="Location" 
                      defaultValue="Denver, CO" 
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      Cancel
                    </Button>
                    <Button className="shadow-lg hover:shadow-xl">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>

              <Card glass className="animate-slide-up [animation-delay:0.4s]">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Hiking Preferences</h2>
                </div>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl transition-all duration-300">
                      <option>🟢 Beginner - New to hiking</option>
                      <option selected>🟡 Intermediate - Some experience</option>
                      <option>🔴 Advanced - Expert hiker</option>
                    </select>
                  </div>

                  <Input 
                    label="Preferred Maximum Distance (miles)" 
                    type="number" 
                    defaultValue="10" 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Preferred Trail Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { name: 'Scenic Views', icon: '🏔️' },
                        { name: 'Waterfalls', icon: '💧' },
                        { name: 'Wildlife', icon: '🦌' },
                        { name: 'Summit Views', icon: '⛰️' },
                        { name: 'Alpine Lakes', icon: '🏞️' },
                        { name: 'Historical Sites', icon: '🏛️' }
                      ].map(feature => (
                        <label key={feature.name} className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                            {feature.icon} {feature.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      Reset
                    </Button>
                    <Button className="shadow-lg hover:shadow-xl">
                      Update Preferences
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card glass className="animate-slide-up [animation-delay:0.5s]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Account Statistics</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Member Since', value: 'Jan 2024', icon: '📅' },
                    { label: 'Total Trips', value: '3', icon: '🎒' },
                    { label: 'Miles Hiked', value: '24.5', icon: '🚶' },
                    { label: 'Trails Completed', value: '8', icon: '✅' }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="text-gray-700 font-medium">{stat.label}</span>
                      </div>
                      <span className="font-bold text-primary-700">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card glass className="animate-slide-up [animation-delay:0.6s]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-accent-400 to-secondary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Emergency Contacts</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Jane Doe</p>
                        <p className="text-sm text-gray-600">Sister</p>
                        <p className="text-sm text-gray-600">+1 (555) 987-6543</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl">
                    Add Contact
                  </Button>
                </div>
              </Card>

              <Card glass className="animate-slide-up [animation-delay:0.7s]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary-400 to-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Privacy Settings</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Public Profile', description: 'Show your profile to other hikers' },
                    { label: 'Share Trip History', description: 'Allow others to see your hiking history' },
                    { label: 'Location Sharing', description: 'Share real-time location during hikes' }
                  ].map((setting, index) => (
                    <label key={setting.label} className="flex items-start justify-between p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          defaultChecked={index === 0}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${index === 0 ? 'bg-primary-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${index === 0 ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};