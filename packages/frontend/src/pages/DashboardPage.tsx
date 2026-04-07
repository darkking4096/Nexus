import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { userId } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to NEXUS Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profiles</h3>
          <p className="text-gray-600">Manage your Instagram profiles</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
          <p className="text-gray-600">Create and schedule posts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600">View performance metrics</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Connect your Instagram profile</li>
          <li>Set your content voice and tone</li>
          <li>Create your first AI-generated post</li>
          <li>Schedule content for autopilot</li>
        </ul>
      </div>

      <p className="text-gray-500 text-sm mt-4">User ID: {userId}</p>
    </div>
  );
};
