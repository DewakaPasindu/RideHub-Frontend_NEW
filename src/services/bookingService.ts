// Re-export from the Laravel API service layer for backwards compatibility
export type { Booking, Booking as BookingRow, BookingFilters, BookingInsert } from './api/types';
export { BookingService } from './api/booking.service';
