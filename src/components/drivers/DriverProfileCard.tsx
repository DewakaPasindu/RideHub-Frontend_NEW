import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Star, Award, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DriverProfileRow } from '../../services/driverService';

interface Props {
  driver: DriverProfileRow;
  showApprovalActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
}

const placeholder = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&q=80';

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return map[s] || 'bg-gray-100 text-gray-700';
};

export default function DriverProfileCard({ driver, showApprovalActions, onApprove, onReject, onSuspend }: Props) {
  const navigate = useNavigate();
  const name = driver.user ? `${driver.user.first_name} ${driver.user.last_name}` : 'Unknown Driver';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={driver.profile_photo || placeholder}
              alt={name}
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              onError={e => { (e.target as HTMLImageElement).src = placeholder; }}
            />
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${driver.availability_status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{name}</h3>
            <div className="flex items-center space-x-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">{driver.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({driver.review_count} reviews)</span>
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(driver.approval_status)}`}>
              {driver.approval_status.charAt(0).toUpperCase() + driver.approval_status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1.5">
            <Award className="h-4 w-4 text-gray-400" />
            <span>{driver.experience_years} yrs exp</span>
          </div>
          {driver.nearest_town && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{driver.nearest_town}</span>
            </div>
          )}
          {driver.phone && (
            <div className="flex items-center space-x-1.5 col-span-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{driver.phone}</span>
            </div>
          )}
        </div>

        {driver.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {driver.specialties.slice(0, 3).map(s => (
              <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
            {driver.specialties.length > 3 && (
              <span className="text-gray-400 text-xs px-2 py-0.5">+{driver.specialties.length - 3} more</span>
            )}
          </div>
        )}

        {driver.rejection_reason && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700"><span className="font-medium">Reason:</span> {driver.rejection_reason}</p>
          </div>
        )}

        <div className="flex space-x-2 pt-3 border-t border-gray-100">
          {showApprovalActions ? (
            <>
              <button onClick={() => onApprove?.(driver.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="h-4 w-4" /><span>Approve</span>
              </button>
              <button onClick={() => onReject?.(driver.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="h-4 w-4" /><span>Reject</span>
              </button>
              <button onClick={() => onSuspend?.(driver.id)} className="flex items-center justify-center px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
                <Clock className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate(`/drivers/${driver.id}`)} className="flex-1 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                View Profile
              </button>
              {driver.approval_status === 'approved' && (
                <button onClick={() => navigate(`/drivers/book/${driver.id}`)} className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Book Driver
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
