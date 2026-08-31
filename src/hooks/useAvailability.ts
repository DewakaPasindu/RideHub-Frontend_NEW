import { useState, useEffect } from 'react';
import { AvailabilityService, AppError } from '../services/availabilityService';

export const useDriverAvailability = (driverId: string) => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadAvailability = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      const data = await AvailabilityService.getDriverAvailability(driverId);
      setAvailability(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error loading availability:', err);
      
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Failed to load availability data');
      }
      
      // Auto-retry for server errors
      const statusCode = (err as { statusCode?: number })?.statusCode ?? 0;
      if (retryCount < maxRetries && statusCode >= 500) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadAvailability(false);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const saveAvailability = async (dates: string[]) => {
    try {
      setLoading(true);
      setError('');
      
      // Optimistic update
      const optimisticData = dates.map(date => ({
        id: `temp-${date}`,
        driverId,
        date,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setAvailability(optimisticData);
      
      await AvailabilityService.setDriverAvailability(driverId, dates);
      await loadAvailability(); // Reload data
      return true;
    } catch (err) {
      console.error('Error saving availability:', err);
      
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Failed to save availability');
      }
      
      // Revert optimistic update on error
      await loadAvailability(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (startDate: string, endDate: string) => {
    try {
      return await AvailabilityService.checkAvailability(driverId, startDate, endDate);
    } catch (err) {
      console.error('Error checking availability:', err);
      
      if (err instanceof AppError) {
        console.warn('Availability check failed:', err.message);
      }
      
      return { isAvailable: false, missingDates: [] };
    }
  };

  // Refresh availability data
  const refreshAvailability = async () => {
    AvailabilityService.clearAvailabilityCache(driverId);
    await loadAvailability();
  };

  useEffect(() => {
    if (driverId) {
      loadAvailability();
      
      // Set up periodic refresh every 5 minutes
      const interval = setInterval(() => {
        loadAvailability(false);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [driverId]);

  return {
    availability,
    loading,
    error,
    retryCount,
    loadAvailability,
    saveAvailability,
    checkAvailability,
    refreshAvailability
  };
};

export const useVehicleAvailability = (vehicleId: string, ownerId: string) => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Similar implementation for vehicle availability
  // This would use vehicle-specific API endpoints

  return {
    availability,
    loading,
    error
  };
};