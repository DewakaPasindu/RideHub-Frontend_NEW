// Backward-compatibility shim — delegates to the new Laravel vehicle service.
import { VehicleService as LaravelVehicleService } from './vehicle.service';
import type { Vehicle, VehicleFilters, VehicleInsert, PaginatedResponse } from './types';

export type { Vehicle, VehicleFilters, VehicleInsert, PaginatedResponse };

export class VehicleService extends LaravelVehicleService {}
