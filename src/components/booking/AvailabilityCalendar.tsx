import React from 'react';
import { Calendar, Plus, X, Clock } from 'lucide-react';
import { AvailabilitySlot } from '../../types/booking';

interface AvailabilityCalendarProps {
  ownerId: string;
  targetId: string;
  targetType: 'vehicle' | 'driver';
  availabilitySlots: AvailabilitySlot[];
  onUpdateAvailability: (slots: AvailabilitySlot[]) => void;
}

export default function AvailabilityCalendar({ 
  ownerId, 
  targetId, 
  targetType, 
  availabilitySlots, 
  onUpdateAvailability 
}: AvailabilityCalendarProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newSlot, setNewSlot] = React.useState({
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    reason: ''
  });

  const handleAddSlot = () => {
    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      const slot: AvailabilitySlot = {
        id: Date.now().toString(),
        ownerId,
        targetId,
        targetType,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isAvailable: newSlot.isAvailable,
        reason: newSlot.reason
      };

      onUpdateAvailability([...availabilitySlots, slot]);
      setNewSlot({ date: '', startTime: '', endTime: '', isAvailable: true, reason: '' });
      setShowAddModal(false);
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    onUpdateAvailability(availabilitySlots.filter(slot => slot.id !== slotId));
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSlotForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availabilitySlots.filter(slot => slot.date === dateString);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Availability Calendar - {targetType === 'vehicle' ? 'Vehicle' : 'Driver'}
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Availability</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {getNextWeekDates().map((date, index) => {
          const slots = getSlotForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-3 ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>

              <div className="space-y-1">
                {slots.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-2">
                    No schedule set
                  </div>
                ) : (
                  slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`text-xs p-2 rounded ${
                        slot.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <button
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      {slot.reason && (
                        <div className="text-xs opacity-75 mt-1">
                          {slot.reason}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Availability Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={newSlot.isAvailable}
                      onChange={() => setNewSlot(prev => ({ ...prev, isAvailable: true }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!newSlot.isAvailable}
                      onChange={() => setNewSlot(prev => ({ ...prev, isAvailable: false }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Unavailable</span>
                  </label>
                </div>
              </div>

              {!newSlot.isAvailable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={newSlot.reason}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Maintenance, Personal time"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddSlot}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Slot
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSlot({ date: '', startTime: '', endTime: '', isAvailable: true, reason: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}