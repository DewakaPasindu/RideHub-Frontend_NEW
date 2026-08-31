// Backward-compatibility shim — delegates to the new Laravel booking service.
import { BookingService as LaravelBookingService } from './booking.service';
import type { Booking, BookingFilters, BookingInsert, PaginatedResponse } from './types';

export type { Booking, BookingFilters, BookingInsert, PaginatedResponse };

export class BookingService extends LaravelBookingService {}
