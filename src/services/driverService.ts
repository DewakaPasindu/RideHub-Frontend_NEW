// Re-export from the Laravel API service layer for backwards compatibility
export type { DriverProfile, DriverProfile as DriverProfileRow, DriverFilters, DriverInsert } from './api/types';
export { DriverService } from './api/driver.service';
