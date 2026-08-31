import React from 'react';
import { Star, Award, Calendar, Shield, MapPin } from 'lucide-react';
import { Driver } from '../../types';
import BookingForm from '../booking/BookingForm';
import PaymentSection from '../booking/PaymentSection';
import { Booking } from '../../types/booking';

interface DriverCardProps {
  driver: Driver & { 
    reviewCount?: number; 
    nearestTown?: string;
  };
  onHire?: () => void;
}

export default function DriverCard({ driver, onHire }: DriverCardProps) {
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
            src={driver.photo} 
            alt={driver.name}
            className="w-full h-48 object-cover"
          />
          <span className={`
            absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold
            ${driver.status === 'available' ? 'bg-green-500 text-white' : 
              driver.status === 'pending' ? 'bg-yellow-500 text-white' : 
              'bg-red-500 text-white'}
          `}>
            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
          </span>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{driver.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-600 text-sm">
                {driver.rating.toFixed(1)}
                {driver.reviewCount && (
                  <span className="text-gray-400"> ({driver.reviewCount})</span>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{driver.age} years old</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="h-4 w-4 mr-2" />
              <span>{driver.experience} years exp.</span>
            </div>
          </div>

          {driver.nearestTown && (
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">Based in {driver.nearestTown}</span>
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Specialties:</h4>
            <div className="flex flex-wrap gap-2">
              {driver.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            {driver.status === 'available' && (
              <button
                onClick={() => setShowBookingForm(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
              >
                Hire Driver
              </button>
            )}
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          type="driver"
          targetId={driver.id}
          targetName={driver.name}
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