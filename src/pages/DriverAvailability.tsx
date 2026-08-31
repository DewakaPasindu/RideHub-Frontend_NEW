import React from 'react';
import { Calendar, Check, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AvailabilityService, AppError } from '../services/availabilityService';
import { getNext60Days, groupDatesByMonth, formatDate } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { logUserAction, logError, logInfo } from '../utils/logger';

export default function DriverAvailability() {
  const { user, isLoggedIn, isDriver } = useAuth();
  const [selectedDates, setSelectedDates] = React.useState<Set<string>>(new Set());
  const [savedDates, setSavedDates] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Check if user is logged in and is a driver
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isDriver()) {
    return <Navigate to="/" replace />;
  }

  // Load existing availability on component mount
  React.useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        logInfo('Loading driver availability', { driverId: user.id });
        
        const availability = await AvailabilityService.getDriverAvailability(user.id);
        const availableDates = availability.map((slot: any) => slot.available_date);
        
        setSelectedDates(new Set(availableDates));
        setSavedDates(new Set(availableDates));
        
        logInfo('Driver availability loaded successfully', { 
          driverId: user.id, 
          availableDatesCount: availableDates.length 
        });
      } catch (error) {
        const errorMessage = error instanceof AppError ? error.message : 'Failed to load availability data';
        setError(errorMessage);
        logError('Failed to load driver availability', error as Error, { driverId: user.id });
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      loadAvailability();
    }
  }, [user?.id]);

  const dates = getNext60Days();

  const toggleDate = (dateString: string) => {
    logUserAction('Toggle availability date', { 
      driverId: user.id, 
      date: dateString, 
      action: selectedDates.has(dateString) ? 'remove' : 'add' 
    });
    
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateString)) {
      newSelected.delete(dateString);
    } else {
      newSelected.add(dateString);
    }
    setSelectedDates(newSelected);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      logUserAction('Save driver availability', { 
        driverId: user.id, 
        selectedDatesCount: selectedDates.size 
      });
      
      await AvailabilityService.setDriverAvailability(user.id, Array.from(selectedDates));
      setSavedDates(new Set(selectedDates));
      setLastSaved(new Date());
      
      logInfo('Driver availability saved successfully', { 
        driverId: user.id, 
        savedDatesCount: selectedDates.size 
      });
      
      alert('Availability saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : 'Failed to save availability. Please try again.';
      setError(errorMessage);
      logError('Failed to save driver availability', error as Error, { driverId: user.id });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    logUserAction('Reset availability changes', { driverId: user.id });
    setSelectedDates(new Set(savedDates));
  };

  const isDateSelected = (dateString: string) => selectedDates.has(dateString);
  const isDateSaved = (dateString: string) => savedDates.has(dateString);

  const getDateClass = (dateString: string) => {
    const base = "w-full h-16 rounded-lg border-2 transition-all duration-200 text-sm font-medium cursor-pointer hover:shadow-md";
    
    if (isDateSelected(dateString)) {
      return `${base} border-green-500 bg-green-100 text-green-800 hover:bg-green-200`;
    }
    
    if (isDateSaved(dateString)) {
      return `${base} border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200`;
    }
    
    return `${base} border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50`;
  };

  const hasChanges = !Array.from(selectedDates).every(date => savedDates.has(date)) || 
                   !Array.from(savedDates).every(date => selectedDates.has(date));

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const datesByMonth = groupDatesByMonth(dates);

  if (loading) {
    return <LoadingSpinner message="Loading availability data..." size="lg" />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError('');
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              Driver Availability Management
            </h1>
            <p className="text-gray-600 mt-2">
              Select the dates when you are available to work. Click on dates to toggle availability.
            </p>
            {lastSaved && (
              <p className="text-sm text-green-600 mt-1">
                Last saved: {lastSaved.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mb-6 flex items-center space-x-6 text-sm bg-gray-50 p-4 rounded-lg">
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

        {/* Calendar Grid by Month */}
        <div className="space-y-8">
          {Object.entries(datesByMonth).map(([monthYear, monthDates]) => (
            <div key={monthYear}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{monthYear}</h2>
              
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar dates */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for proper day alignment */}
                {Array.from({ length: monthDates[0].getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="h-16"></div>
                ))}
                
                {/* Date cells */}
                {monthDates.map((date, index) => {
                  const dateString = date.toISOString().split('T')[0];
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && toggleDate(dateString)}
                      disabled={isPast}
                      className={`${getDateClass(dateString)} ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={`text-lg ${isToday ? 'font-bold text-blue-600' : ''}`}>
                          {date.getDate()}
                        </span>
                        {isDateSelected(dateString) && (
                          <Check className="h-4 w-4 text-green-600 mt-1" />
                        )}
                        {isToday && (
                          <span className="text-xs text-blue-600 font-medium">Today</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Availability Summary:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Selected Dates:</span> {selectedDates.size}
            </div>
            <div>
              <span className="font-medium">Currently Saved:</span> {savedDates.size}
            </div>
            <div>
              <span className="font-medium">Total Days Available:</span> {dates.length}
            </div>
          </div>
          {hasChanges && (
            <p className="text-sm text-orange-600 mt-2 font-medium">
              ⚠️ You have unsaved changes. Click "Save Changes" to update your availability.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}