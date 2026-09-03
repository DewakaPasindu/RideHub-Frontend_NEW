// Shared API response types matching Laravel 12 + Sanctum response envelopes.

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

export interface Meta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  role: 'user' | 'driver' | 'admin' | 'superadmin';
  is_driver: boolean;
  mobile_number: string | null;
  profile_photo: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  vehicle_number: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type: string;
  seat_count: number;
  fuel_type: string;
  transmission: string;
  pricing_type?: 'per_day' | 'per_km' | 'both';
  price_per_day: number;
  price_per_km?: number | null;
  included_km_per_day?: number;
  extra_km_rate?: number;
  description: string | null;
  images: string[];
  has_ac: boolean;
  nearest_town: string | null;
  features: string[];
  availability_status: string;
  approval_status: string;
  rejection_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  owner?: { first_name: string; last_name: string; email: string; mobile_number: string | null };
  avg_rating?: number;
  review_count?: number;
  ai_score?: number;
  ai_confidence?: number;
  ai_reasons?: string[];
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string;
  experience_years: number;
  phone: string | null;
  address: string | null;
  profile_photo: string | null;
  specialties: string[];
  nearest_town: string | null;
  rating: number;
  review_count: number;
  verification_status: string;
  availability_status: string;
  approval_status: string;
  rejection_reason: string | null;
  suspension_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { first_name: string; last_name: string; email: string; mobile_number: string | null };
  ai_score?: number;
  ai_distance_score?: number;
  ai_experience_score?: number;
  ai_rating_score?: number;
  ai_availability_score?: number;
  ai_reason?: string;
  distance_km?: number;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_type: 'vehicle' | 'driver';
  vehicle_id: string | null;
  driver_profile_id: string | null;
  target_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  nearest_town: string | null;
  ac_preference: string | null;
  passenger_count: number;
  total_amount: number;
  advance_amount: number;
  payment_receipt_url: string | null;
  status: string;
  driver_assigned_id: string | null;
  trip_started_at: string | null;
  trip_ended_at: string | null;
  notes: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  user?: { first_name: string; last_name: string; email: string; mobile_number: string | null };
  vehicle?: {
    brand: string;
    model: string;
    vehicle_number: string;
    uuid?: string;
    owner?: {
      name: string;
      phone: string | null;
      email: string | null;
    } | null;
  } | null;
  driver_profile?: { license_number: string; user: { first_name: string; last_name: string } } | null;
}

export interface Review {
  id: string;
  user_id: string;
  booking_id: string | null;
  target_type: 'vehicle' | 'driver';
  vehicle_id: string | null;
  driver_profile_id: string | null;
  target_name: string;
  rating: number;
  comment: string | null;
  photos: string[];
  status: string;
  moderation_note: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { first_name: string; last_name: string; profile_photo: string | null };
}

export interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface Availability {
  id: string;
  driver_id: string;
  available_date: string;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_vehicles: number;
  pending_vehicles: number;
  total_drivers: number;
  pending_drivers: number;
  booking_counts: Record<string, number>;
  total_revenue: number;
  monthly_revenue: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'superadmin';
  last_login: string | null;
  created_at: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  display_name: string;
  address: { road?: string; city?: string; state?: string; country?: string };
}

export interface VehicleRecommendation {
  vehicle: Vehicle;
  score: number;
  confidence: number;
  reasons: string[];
  rank: number;
}

export interface DriverMatch {
  driver: DriverProfile;
  distance_score: number;
  experience_score: number;
  rating_score: number;
  availability_score: number;
  final_score: number;
  distance_km: number;
  reason: string;
  estimated_arrival_min: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  trip_info?: Record<string, unknown>;
  suggestions?: string[];
}

export interface VehicleFilters {
  search?: string;
  vehicle_type?: string;
  vehicle_model?: string;
  min_price?: number;
  max_price?: number;
  budget_per_km?: number;
  has_ac?: boolean;
  nearest_town?: string;
  transmission?: string;
  fuel_type?: string;
  min_seats?: number;
  with_driver?: boolean;
  approval_status?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface DriverFilters {
  search?: string;
  min_experience?: number;
  max_experience?: number;
  min_rating?: number;
  nearest_town?: string;
  specialty?: string;
  availability_status?: string;
  approval_status?: string;
  license_type?: 'light' | 'heavy' | '';
  budget_per_day?: number;
  location_lat?: number;
  location_lng?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface BookingFilters {
  status?: string;
  booking_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export type VehicleInsert = Omit<
  Vehicle,
  | 'id'
  | 'approval_status'
  | 'approved_at'
  | 'approved_by'
  | 'rejection_reason'
  | 'created_at'
  | 'updated_at'
  | 'owner'
  | 'avg_rating'
  | 'review_count'
  | 'ai_score'
  | 'ai_confidence'
  | 'ai_reasons'
>;

export type DriverInsert = Omit<
  DriverProfile,
  | 'id'
  | 'rating'
  | 'review_count'
  | 'approval_status'
  | 'verification_status'
  | 'approved_at'
  | 'approved_by'
  | 'rejection_reason'
  | 'suspension_reason'
  | 'created_at'
  | 'updated_at'
  | 'user'
  | 'ai_score'
  | 'ai_distance_score'
  | 'ai_experience_score'
  | 'ai_rating_score'
  | 'ai_availability_score'
  | 'ai_reason'
  | 'distance_km'
>;

export type BookingInsert = Omit<
  Booking,
  | 'id'
  | 'status'
  | 'driver_assigned_id'
  | 'trip_started_at'
  | 'trip_ended_at'
  | 'rejection_reason'
  | 'approved_at'
  | 'approved_by'
  | 'rejected_at'
  | 'cancelled_at'
  | 'created_at'
  | 'updated_at'
>;

export interface ProfessionalCapabilities {
  is_driver: boolean;
  is_vehicle_owner: boolean;
  is_combined: boolean;
  has_professional_access: boolean;
  driver_status: 'approved' | 'pending' | 'rejected' | 'none';
  vehicle_owner_status: 'approved' | 'pending' | 'rejected' | 'none';
}

export interface MonthlyTrendItem {
  month: number;
  year: number;
  label: string;
  short_label: string;
  gross: number;
  platform_fee: number;
  net: number;
  driver_gross: number;
  rental_gross: number;
}

export interface EarningRecord {
  id: number;
  uuid: string;
  user_id: number;
  earning_type: 'RIDE' | 'VEHICLE_RENTAL';
  reference_type: string;
  reference_id: number;
  reference_uuid: string;
  gross_amount: number;
  platform_fee_rate: number;
  platform_fee_amount: number;
  net_amount: number;
  earning_date: string;
  status: 'available' | 'pending' | 'paid' | 'cancelled';
  description: string;
  metadata?: any;
  created_at: string;
}

export interface StatementPayment {
  id: number;
  uuid: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  paid_at: string;
  status: string;
}

export interface MonthlyStatement {
  id: number;
  uuid: string;
  user_id: number;
  statement_month: number;
  statement_year: number;
  month_name: string;
  gross_amount: number;
  platform_fee_rate: number;
  platform_fee_amount: number;
  adjustments: number;
  net_amount: number;
  amount_paid: number;
  amount_due: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  generated_at: string;
  paid_at?: string | null;
  payment_reference?: string | null;
  payment_method?: string | null;
  payments?: StatementPayment[];
}

export interface VehiclePerformanceItem {
  vehicle_id: number;
  uuid: string;
  brand: string;
  model: string;
  vehicle_number: string;
  rentals_count: number;
  rental_days: number;
  gross_earnings: number;
  platform_fee: number;
  net_earnings: number;
  average_rating: number;
  utilization_rate: number;
}

export interface ProfessionalOverview {
  capabilities: ProfessionalCapabilities;
  this_month: {
    gross: number;
    platform_fee: number;
    net: number;
    rides_count: number;
    rentals_count: number;
    total_services: number;
    growth_percentage: number;
  };
  lifetime: {
    gross: number;
    platform_fee: number;
    net: number;
    total_services: number;
  };
  active_statement?: MonthlyStatement | null;
  breakdown_by_type: {
    rides: { gross: number; fee: number; net: number; count: number };
    rentals: { gross: number; fee: number; net: number; count: number };
  };
  monthly_trend: MonthlyTrendItem[];
  recent_earnings: EarningRecord[];
}

export interface DriverAnalyticsData {
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  gross_earnings: number;
  platform_fee: number;
  net_earnings: number;
  average_per_ride: number;
  this_month_gross: number;
  this_month_rides: number;
  rating: number;
  review_count: number;
}

export interface VehicleOwnerAnalyticsData {
  total_vehicles: number;
  active_vehicles: number;
  rented_vehicles: number;
  total_rentals: number;
  total_rental_days: number;
  gross_earnings: number;
  platform_fee: number;
  net_earnings: number;
  average_rental_revenue: number;
  fleet_utilization: number;
  vehicle_performance_table: VehiclePerformanceItem[];
}
