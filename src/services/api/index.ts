// Central barrel — import all API services from here
export { default as api, tokenStore, userStore, withRetry, unwrap, unwrapPaginated, multipartConfig, API_BASE_URL } from './client';
export type { NormalizedApiError } from './client';

// Shared types
export type {
  ApiResponse,
  ValidationErrorResponse,
  Meta,
  PaginatedResponse,
  AuthResponse,
  User,
  Vehicle,
  DriverProfile,
  Booking,
  Review,
  ReviewStats,
  Notification,
  Availability,
  DashboardStats,
  AdminUser,
  Coordinates,
  LocationSuggestion,
  ReverseGeocodeResult,
  VehicleRecommendation,
  DriverMatch,
  ChatMessage,
  ChatResponse,
  VehicleFilters,
  DriverFilters,
  BookingFilters,
  VehicleInsert,
  DriverInsert,
  BookingInsert,
} from './types';

// New Laravel 12 service layer (snake_case file names)
export { AuthService } from './auth.service';
export type { LoginPayload, RegisterPayload, AdminLoginPayload, AdminRegisterPayload } from './auth.service';

export { VehicleService } from './vehicle.service';
export { DriverService } from './driver.service';
export { BookingService } from './booking.service';
export { ReviewService } from './review.service';
export { NotificationService } from './notification.service';
export { AvailabilityService } from './availability.service';
export type { AvailabilityFilters } from './availability.service';
export { UploadService } from './upload.service';
export type { UploadResult } from './upload.service';
export { LocationService } from './location.service';
export { AIService } from './ai.service';
export type { VehicleRecommendationRequest, DriverMatchRequest, TripRequest, TripAnalysis } from './ai.service';
export { AdminService } from './admin.service';
export type { AdminUserPayload } from './admin.service';

// Backward-compatible PascalCase service re-exports (legacy consumers)
export { AuthenticationService } from './AuthenticationService';
export { VehicleService as VehicleServiceLegacy } from './VehicleService';
export { DriverService as DriverServiceLegacy } from './DriverService';
export { BookingService as BookingServiceLegacy } from './BookingService';
export { ReviewService as ReviewServiceLegacy } from './ReviewService';
export { NotificationService as NotificationServiceLegacy } from './NotificationService';
export { DashboardService } from './DashboardService';
export { LocationService as LocationServiceLegacy } from './LocationService';
export { AIService as AIServiceLegacy } from './AIService';
export { TripSearchService } from './TripSearchService';
export { RouteService } from './RouteService';
export type { RoutePoint, OsrmRoute, RouteResult, DeviationEvent } from './RouteService';

// Legacy aliases used by existing components
export type { Vehicle as VehicleRow } from './types';
export type { DriverProfile as DriverProfileRow } from './types';
export type { Booking as BookingRow } from './types';
export type { Review as ReviewRow } from './types';
export type { VehicleInsert } from './types';
export type { DriverInsert } from './types';
