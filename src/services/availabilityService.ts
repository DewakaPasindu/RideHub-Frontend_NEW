// Re-export from the Laravel API service layer for backwards compatibility.
// Preserves the AppError class and caching behaviour used by existing consumers.
import { AvailabilityService as LaravelAvailabilityService } from './api/availability.service';
import type { Availability } from './api/types';
import { logInfo, logError, logUserAction } from '../utils/logger';

export interface AvailabilitySlot {
  id: string;
  driverId: string;
  date: string;
  isAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export class AvailabilityService {
  static async getDriverAvailability(driverId: string, startDate?: string, endDate?: string): Promise<Availability[]> {
    try {
      logInfo('Fetching driver availability', { driverId, startDate, endDate });
      const cacheKey = `availability:${driverId}:${startDate}:${endDate}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const c = JSON.parse(cached) as { data: Availability[]; timestamp: string };
        if (Date.now() - new Date(c.timestamp).getTime() < 5 * 60 * 1000) return c.data;
      }
      const data = await LaravelAvailabilityService.getDriverAvailability(driverId, startDate, endDate);
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: new Date().toISOString() }));
      return data;
    } catch (err) {
      logError('Error fetching driver availability', err as Error, { driverId });
      throw err instanceof AppError ? err : new AppError('Failed to fetch availability data', 400);
    }
  }

  static async setDriverAvailability(driverId: string, dates: string[]): Promise<void> {
    try {
      logUserAction('Set driver availability', { driverId, datesCount: dates.length });
      if (!driverId || !dates.length) throw new AppError('Driver ID and dates are required', 400);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invalid = dates.filter((d) => {
        const dt = new Date(d);
        return isNaN(dt.getTime()) || dt < today;
      });
      if (invalid.length) throw new AppError('Cannot set availability for past dates', 400);
      await LaravelAvailabilityService.setDriverAvailability(driverId, dates);
      this.clearAvailabilityCache(driverId);
    } catch (err) {
      logError('Error setting driver availability', err as Error, { driverId });
      throw err instanceof AppError ? err : new AppError('Failed to save availability', 400);
    }
  }

  static async checkAvailability(driverId: string, startDate: string, endDate: string) {
    const availability = await this.getDriverAvailability(driverId, startDate, endDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const required: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      required.push(d.toISOString().split('T')[0]);
    }
    const available = availability
      .filter((s) => s.is_available)
      .map((s) => s.available_date);
    return {
      isAvailable: required.every((d) => available.includes(d)),
      availableDates: available,
      requiredDates: required,
      missingDates: required.filter((d) => !available.includes(d)),
    };
  }

  static async getCalendarView(driverId: string) {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getDriverAvailability(driverId, startDate, endDate);
  }

  static clearAvailabilityCache(driverId: string) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`availability:${driverId}`))
      .forEach((k) => localStorage.removeItem(k));
  }

  static async updateAvailabilitySlot(_id: string, _data: Partial<AvailabilitySlot>) {
    throw new AppError('Use setDriverAvailability to manage availability', 400);
  }

  static async removeAvailabilitySlot(_id: string) {
    throw new AppError('Use setDriverAvailability to manage availability', 400);
  }
}
