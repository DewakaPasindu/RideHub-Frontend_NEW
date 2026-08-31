import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Users, Fuel, Settings, Snowflake, Star, CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react';
import { VehicleRow } from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  vehicle: VehicleRow;
  showApprovalActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return map[s] || 'bg-gray-100 text-gray-700';
};

const placeholder = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80';

export default function VehicleListCard({ vehicle, showApprovalActions, onApprove, onReject }: Props) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const mainImage = vehicle.images?.[0] || placeholder;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        <div className="absolute top-3 left-3 flex space-x-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(vehicle.approval_status)}`}>
            {vehicle.approval_status.charAt(0).toUpperCase() + vehicle.approval_status.slice(1)}
          </span>
          {vehicle.has_ac && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1">
              <Snowflake className="h-3 w-3" />
              <span>AC</span>
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium capitalize">{vehicle.vehicle_type}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.vehicle_number}</p>
          </div>
          {vehicle.avg_rating && (
            <div className="flex items-center space-x-1 text-amber-500 ml-2">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">{vehicle.avg_rating}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{vehicle.seat_count} seats</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Fuel className="h-4 w-4 text-gray-400" />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          {vehicle.nearest_town && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{vehicle.nearest_town}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-blue-600">LKR {vehicle.price_per_day.toLocaleString()}</span>
            <span className="text-gray-500 text-sm">/day</span>
          </div>
          <div className="flex space-x-2">
            {showApprovalActions ? (
              <>
                <button onClick={() => onApprove?.(vehicle.id)} className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button onClick={() => onReject?.(vehicle.id)} className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Details
                </button>
                {vehicle.approval_status === 'approved' && isLoggedIn && (
                  <button onClick={() => navigate(`/vehicles/book/${vehicle.id}`)} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {vehicle.rejection_reason && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700"><span className="font-medium">Rejected:</span> {vehicle.rejection_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
