import React from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { Booking } from '../../types/booking';

interface BookingFormProps {
  type: 'vehicle' | 'driver';
  targetId: string;
  targetName: string;
  pricePerDay?: number;
  onSubmit: (bookingData: Partial<Booking>) => void;
  onCancel: () => void;
}

export default function BookingForm({ type, targetId, targetName, pricePerDay, onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = React.useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    pickupLocation: '',
    dropoffLocation: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    notes: '',
    nearestTown: '',
    acPreference: ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [totalAmount, setTotalAmount] = React.useState(0);

  const towns = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
    'Polonnaruwa', 'Batticaloa', 'Trincomalee', 'Matara', 'Ratnapura', 
    'Badulla', 'Kurunegala', 'Puttalam', 'Kalutara'
  ];

  React.useEffect(() => {
    if (formData.startDate && formData.endDate && pricePerDay) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setTotalAmount(days * pricePerDay);
    }
  }, [formData.startDate, formData.endDate, pricePerDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = 'Drop-off location is required';
    if (!formData.userName.trim()) newErrors.userName = 'Name is required';
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Email is invalid';
    }
    if (!formData.userPhone.trim()) newErrors.userPhone = 'Phone is required';
    if (!formData.nearestTown) newErrors.nearestTown = 'Please select your nearest town';
    if (type === 'vehicle' && !formData.acPreference) newErrors.acPreference = 'Please select A/C preference';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const bookingData: Partial<Booking> = {
        type,
        targetId,
        targetName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        totalAmount,
        notes: formData.notes,
        nearestTown: formData.nearestTown,
        acPreference: formData.acPreference,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      onSubmit(bookingData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {type === 'vehicle' ? 'Vehicle' : 'Driver'}: {targetName}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  </div>
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  </div>
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.startTime ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  </div>
                  {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.endTime ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  </div>
                  {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.pickupLocation ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Enter pickup location"
                    />
                  </div>
                  {errors.pickupLocation && <p className="mt-1 text-sm text-red-600">{errors.pickupLocation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drop-off Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.dropoffLocation ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Enter drop-off location"
                    />
                  </div>
                  {errors.dropoffLocation && <p className="mt-1 text-sm text-red-600">{errors.dropoffLocation}</p>}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Town *
                  </label>
                  <select
                    name="nearestTown"
                    value={formData.nearestTown}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.nearestTown ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                  >
                    <option value="">Select your nearest town</option>
                    {towns.map(town => (
                      <option key={town} value={town}>{town}</option>
                    ))}
                  </select>
                  {errors.nearestTown && <p className="mt-1 text-sm text-red-600">{errors.nearestTown}</p>}
                </div>

                {type === 'vehicle' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      A/C Preference *
                    </label>
                    <select
                      name="acPreference"
                      value={formData.acPreference}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.acPreference ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    >
                      <option value="">Select A/C preference</option>
                      <option value="ac">A/C Required</option>
                      <option value="non-ac">Non A/C Acceptable</option>
                      <option value="either">Either A/C or Non A/C</option>
                    </select>
                    {errors.acPreference && <p className="mt-1 text-sm text-red-600">{errors.acPreference}</p>}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.userName ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.userEmail ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.userEmail && <p className="mt-1 text-sm text-red-600">{errors.userEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="userPhone"
                      value={formData.userPhone}
                      onChange={handleChange}
                      className={`pl-10 w-full rounded-md border ${
                        errors.userPhone ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.userPhone && <p className="mt-1 text-sm text-red-600">{errors.userPhone}</p>}
                </div>
              </div>
            </div>

            {/* Total Amount */}
            {totalAmount > 0 && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalAmount}</span>
                </div>
                {pricePerDay && (
                  <p className="text-sm text-gray-600 mt-1">
                    Based on ${pricePerDay}/day for {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                  </p>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Submit Booking
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}