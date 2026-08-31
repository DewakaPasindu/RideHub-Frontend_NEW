import React from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Booking } from '../../types/booking';

interface BookingCardProps {
  booking: Booking;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onView?: (booking: Booking) => void;
  showActions?: boolean;
}

export default function BookingCard({ booking, onApprove, onReject, onView, showActions = false }: BookingCardProps) {
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim() && onReject) {
      onReject(booking.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.type === 'vehicle' ? 'Vehicle' : 'Driver'}: {booking.targetName}
            </h3>
            <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{booking.userName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span>{booking.userEmail}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{booking.userPhone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{booking.pickupLocation}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-blue-600">${booking.totalAmount}</span>
            <span className="text-sm text-gray-500 ml-2">
              Created: {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(booking)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
            )}
            
            {showActions && booking.status === 'pending' && (
              <>
                {onApprove && (
                  <button
                    onClick={() => onApprove(booking.id)}
                    className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Notes:</strong> {booking.notes}
            </p>
          </div>
        )}

        {booking.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Rejection Reason:</strong> {booking.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Booking</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this booking:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reject Booking
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}