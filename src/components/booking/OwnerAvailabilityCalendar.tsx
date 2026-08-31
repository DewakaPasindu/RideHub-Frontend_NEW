import React from 'react';
import { Calendar, Check, X, Save } from 'lucide-react';

interface OwnerAvailabilityCalendarProps {
  ownerId: string;
  targetId: string;
  targetType: 'vehicle' | 'driver';
  targetName: string;
}

export default function OwnerAvailabilityCalendar({ 
  ownerId, 
  targetId, 
  targetType, 
  targetName 
}: OwnerAvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = React.useState<Set<string>>(new Set());
  const [savedDates, setSavedDates] = React.useState<Set<string>>(new Set());

  // Generate next 60 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const toggleDate = (dateString: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateString)) {
      newSelected.delete(dateString);
    } else {
      newSelected.add(dateString);
    }
    setSelectedDates(newSelected);
  };

  const handleSave = () => {
    setSavedDates(new Set(selectedDates));
    // TODO: Save to backend
    console.log('Saving availability for:', { ownerId, targetId, targetType, dates: Array.from(selectedDates) });
    alert('Availability saved successfully!');
  };

  const isDateSelected = (dateString: string) => selectedDates.has(dateString);
  const isDateSaved = (dateString: string) => savedDates.has(dateString);

  const getDateClass = (dateString: string) => {
    const base = "w-full h-12 rounded-lg border-2 transition-all duration-200 text-sm font-medium";
    
    if (isDateSelected(dateString)) {
      return `${base} border-green-500 bg-green-100 text-green-800 hover:bg-green-200`;
    }
    
    if (isDateSaved(dateString)) {
      return `${base} border-blue-500 bg-blue-100 text-blue-800`;
    }
    
    return `${base} border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50`;
  };

  const hasChanges = !Array.from(selectedDates).every(date => savedDates.has(date)) || 
                   !Array.from(savedDates).every(date => selectedDates.has(date));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Set Availability - {targetName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Click on dates to mark them as available for booking
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>
          <span>Selected (Available)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
          <span>Currently Saved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div>
          <span>Not Available</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Dates */}
        {dates.map((date, index) => {
          const dateString = date.toISOString().split('T')[0];
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <button
              key={index}
              onClick={() => toggleDate(dateString)}
              className={getDateClass(dateString)}
            >
              <div className="flex flex-col items-center">
                <span className={isToday ? 'font-bold' : ''}>{date.getDate()}</span>
                {index < 7 && (
                  <span className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Summary:</h4>
        <p className="text-sm text-gray-600">
          Selected {selectedDates.size} available dates out of {dates.length} total dates
        </p>
        {hasChanges && (
          <p className="text-sm text-orange-600 mt-1">
            You have unsaved changes. Click "Save Changes" to update your availability.
          </p>
        )}
      </div>
    </div>
  );
}