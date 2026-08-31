import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvailabilityService, AppError } from '../services/availabilityService';

// Mock the Laravel availability service
vi.mock('../services/api/availability.service', () => ({
  AvailabilityService: {
    getDriverAvailability: vi.fn(),
    setDriverAvailability: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('AvailabilityService', () => {
  const mockDriverId = 'test-driver-id';
  const mockDates = ['2024-02-01', '2024-02-02', '2024-02-03'];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setDriverAvailability', () => {
    it('should set driver availability successfully', async () => {
      const { AvailabilityService as LaravelAvailabilityService } = await import('../services/api/availability.service');
      vi.mocked(LaravelAvailabilityService.setDriverAvailability).mockResolvedValue(undefined);

      await AvailabilityService.setDriverAvailability(mockDriverId, mockDates);

      expect(LaravelAvailabilityService.setDriverAvailability).toHaveBeenCalledWith(mockDriverId, mockDates);
    });

    it('should validate input parameters', async () => {
      await expect(AvailabilityService.setDriverAvailability('', [])).rejects.toThrow('Driver ID and dates are required');
    });

    it('should reject past dates', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];

      await expect(AvailabilityService.setDriverAvailability(mockDriverId, [pastDate])).rejects.toThrow('Cannot set availability for past dates');
    });
  });

  describe('getDriverAvailability', () => {
    it('should return cached data when available', async () => {
      const mockData = [
        { id: '1', driver_id: mockDriverId, available_date: '2024-02-01', is_available: true, notes: null, created_at: '', updated_at: '' },
      ];

      localStorage.setItem(
        `availability:${mockDriverId}:undefined:undefined`,
        JSON.stringify({ data: mockData, timestamp: new Date().toISOString() })
      );

      const result = await AvailabilityService.getDriverAvailability(mockDriverId);
      expect(result).toEqual(mockData);
    });

    it('should fetch from API when cache is expired', async () => {
      const mockData = [
        { id: '1', driver_id: mockDriverId, available_date: '2024-02-01', is_available: true, notes: null, created_at: '', updated_at: '' },
      ];

      const expiredTime = new Date();
      expiredTime.setMinutes(expiredTime.getMinutes() - 10);

      localStorage.setItem(
        `availability:${mockDriverId}:undefined:undefined`,
        JSON.stringify({ data: mockData, timestamp: expiredTime.toISOString() })
      );

      const { AvailabilityService as LaravelAvailabilityService } = await import('../services/api/availability.service');
      vi.mocked(LaravelAvailabilityService.getDriverAvailability).mockResolvedValue(mockData);

      const result = await AvailabilityService.getDriverAvailability(mockDriverId);

      expect(LaravelAvailabilityService.getDriverAvailability).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability status for date range', async () => {
      const mockAvailability = [
        { id: '1', driver_id: mockDriverId, available_date: '2024-02-01', is_available: true, notes: null, created_at: '', updated_at: '' },
        { id: '2', driver_id: mockDriverId, available_date: '2024-02-02', is_available: true, notes: null, created_at: '', updated_at: '' },
      ];

      vi.spyOn(AvailabilityService, 'getDriverAvailability').mockResolvedValue(mockAvailability);

      const result = await AvailabilityService.checkAvailability(mockDriverId, '2024-02-01', '2024-02-02');

      expect(result.isAvailable).toBe(true);
      expect(result.missingDates).toHaveLength(0);
    });

    it('should detect missing dates', async () => {
      const mockAvailability = [
        { id: '1', driver_id: mockDriverId, available_date: '2024-02-01', is_available: true, notes: null, created_at: '', updated_at: '' },
      ];

      vi.spyOn(AvailabilityService, 'getDriverAvailability').mockResolvedValue(mockAvailability);

      const result = await AvailabilityService.checkAvailability(mockDriverId, '2024-02-01', '2024-02-02');

      expect(result.isAvailable).toBe(false);
      expect(result.missingDates).toContain('2024-02-02');
    });
  });

  describe('AppError', () => {
    it('should construct with message and status code', () => {
      const err = new AppError('test', 400);
      expect(err.message).toBe('test');
      expect(err.statusCode).toBe(400);
      expect(err.isOperational).toBe(true);
    });
  });
});
