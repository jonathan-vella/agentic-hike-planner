import React from 'react';
import { Button, Card, Input } from '../../components/ui';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and hiking preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <form className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" defaultValue="John" />
                <Input label="Last Name" defaultValue="Doe" />
              </div>

              <Input label="Email" type="email" defaultValue="john.doe@example.com" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
                <Input label="Location" defaultValue="Denver, CO" />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hiking Preferences</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                  <option>Beginner</option>
                  <option selected>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <Input label="Preferred Maximum Distance (miles)" type="number" defaultValue="10" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Trail Features
                </label>
                <div className="space-y-2">
                  {['Scenic Views', 'Waterfalls', 'Wildlife', 'Summit Views', 'Alpine Lakes', 'Historical Sites'].map(feature => (
                    <label key={feature} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Reset</Button>
                <Button>Update Preferences</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trips</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miles Hiked</span>
                <span className="font-medium">24.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trails Completed</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-100 rounded">
                <p className="font-medium text-gray-900">Jane Doe</p>
                <p className="text-sm text-gray-600">Sister</p>
                <p className="text-sm text-gray-600">+1 (555) 987-6543</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Add Contact
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Public Profile</span>
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Share Trip History</span>
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Location Sharing</span>
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};