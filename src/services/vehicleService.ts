// Re-export from the Laravel API service layer for backwards compatibility
export type { Vehicle, Vehicle as VehicleRow, VehicleFilters, VehicleInsert, PaginatedResponse } from './api/types';
export { VehicleService } from './api/vehicle.service';
