import React from 'react';
import { Car, User, Calendar, AlertCircle } from 'lucide-react';
import { Vehicle, Driver } from '../../types';

interface RejectedItem {
  id: string;
  type: 'vehicle' | 'driver';
  details: Vehicle | Driver;
  rejectionReason: string;
  rejectedAt: string;
}

export default function RejectedItems() {
  const [rejectedItems] = React.useState<RejectedItem[]>([
    {
      id: '1',
      type: 'vehicle',
      details: {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        type: 'car',
        pricePerDay: 150,
        images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027'],
        status: 'rejected',
        features: ['Automatic', 'Bluetooth', 'Backup Camera']
      },
      rejectionReason: 'Vehicle documentation incomplete',
      rejectedAt: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'driver',
      details: {
        id: '2',
        name: 'Robert Wilson',
        age: 28,
        experience: 3,
        license: 'DL456789',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        status: 'rejected',
        rating: 0,
        specialties: ['City Driving']
      },
      rejectionReason: 'License verification failed',
      rejectedAt: '2024-03-14T15:45:00Z'
    }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rejected Applications</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 p-6">
          {rejectedItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${
                  item.type === 'vehicle' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {item.type === 'vehicle' ? (
                    <Car className="h-6 w-6 text-blue-600" />
                  ) : (
                    <User className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">
                      {item.type === 'vehicle' 
                        ? `${(item.details as Vehicle).make} ${(item.details as Vehicle).model}`
                        : (item.details as Driver).name
                      }
                    </h3>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                      Rejected
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Reason: {item.rejectionReason}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Rejected on: {new Date(item.rejectedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}