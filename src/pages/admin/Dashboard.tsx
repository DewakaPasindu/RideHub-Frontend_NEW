import React from 'react';
import { Car, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Vehicles', value: 45, icon: Car, color: 'blue' },
    { title: 'Total Drivers', value: 28, icon: Users, color: 'green' },
    { title: 'Pending Approvals', value: 12, icon: AlertCircle, color: 'yellow' },
    { title: 'Active Rentals', value: 18, icon: CheckCircle, color: 'indigo' }
  ];

  const recentActivities = [
    { type: 'vehicle_approval', status: 'approved', item: 'Tesla Model 3', time: '2 hours ago' },
    { type: 'driver_request', status: 'pending', item: 'John Smith', time: '3 hours ago' },
    { type: 'vehicle_rental', status: 'active', item: 'BMW X5', time: '5 hours ago' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                {activity.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {activity.status === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                {activity.status === 'active' && <Car className="h-5 w-5 text-blue-500" />}
                <div>
                  <p className="font-medium">{activity.item}</p>
                  <p className="text-sm text-gray-500">{activity.type.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}