// Backward-compatibility shim — delegates to the new Laravel driver service.
import { DriverService as LaravelDriverService } from './driver.service';
import type { DriverProfile, DriverFilters, DriverInsert, PaginatedResponse } from './types';

export type { DriverProfile, DriverProfile as DriverProfileRow, DriverFilters, DriverInsert, PaginatedResponse };

export class DriverService extends LaravelDriverService {}
