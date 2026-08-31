import React from 'react';
import { Car, Users, Fuel, Calendar, Star, MapPin, Snowflake } from 'lucide-react';
import { Vehicle } from '../../types';
import BookingForm from '../booking/BookingForm';
import PaymentSection from '../booking/PaymentSection';
import { Booking } from '../../types/booking';

interface VehicleCardProps {
  vehicle: Vehicle & { 
    rating?: number; 
    reviewCount?: number; 
    nearestTown?: string;
    hasAC?: boolean;
  };
  onBook?: () => void;
}

export default function VehicleCard({ vehicle, onBook }: VehicleCardProps) {
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [showPaymentSection, setShowPaymentSection] = React.useState(false);
  const [currentBooking, setCurrentBooking] = React.useState<Partial<Booking> | null>(null);

  const handleBookingSubmit = (bookingData: Partial<Booking>) => {
    // Generate booking ID
    const bookingId = 'BK' + Date.now().toString().slice(-6);
    const bookingWithId = { ...bookingData, id: bookingId };
    
    setCurrentBooking(bookingWithId);
    setShowBookingForm(false);
    setShowPaymentSection(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentSection(false);
    setCurrentBooking(null);
    alert('Booking submitted successfully! You will receive a confirmation email shortly.');
  };

  const handleCancel = () => {
    setShowBookingForm(false);
    setShowPaymentSection(false);
    setCurrentBooking(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={vehicle.images[0]} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-48 object-cover"
          />
          <span className={`
            absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold
            ${vehicle.status === 'available' ? 'bg-green-500 text-white' : 
              vehicle.status === 'pending' ? 'bg-yellow-500 text-white' : 
              'bg-red-500 text-white'}
          `}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </span>
          
          {vehicle.hasAC && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Snowflake className="h-3 w-3 mr-1" />
              A/C
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{vehicle.make} {vehicle.model}</h3>
            {vehicle.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600 text-sm">
                  {vehicle.rating.toFixed(1)}
                  {vehicle.reviewCount && (
                    <span className="text-gray-400"> ({vehicle.reviewCount})</span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Car className="h-4 w-4 mr-2" />
              <span>{vehicle.type}</span>
            </div>
          </div>

          {vehicle.nearestTown && (
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">Near {vehicle.nearestTown}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}/day</span>
            <div className="flex space-x-2">
              {vehicle.status === 'available' && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Features:</h4>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          type="vehicle"
          targetId={vehicle.id}
          targetName={`${vehicle.make} ${vehicle.model}`}
          pricePerDay={vehicle.pricePerDay}
          onSubmit={handleBookingSubmit}
          onCancel={handleCancel}
        />
      )}

      {showPaymentSection && currentBooking && (
        <PaymentSection
          bookingId={currentBooking.id!}
          totalAmount={currentBooking.totalAmount!}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}