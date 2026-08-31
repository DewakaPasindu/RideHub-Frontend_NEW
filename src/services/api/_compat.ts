// Compat aliases so existing pages that import from 'bookingService' and use BookingRow still compile
import type { Booking } from './types';
export type BookingRow = Booking;
