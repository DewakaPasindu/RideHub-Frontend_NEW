// Legacy API surface — kept for backwards compatibility with older consumers
// and tests. All calls now delegate to the new Laravel 12 + Sanctum service
// layer in ./api/. Refresh-token logic has been removed; Sanctum personal
// access tokens are the only auth mechanism.
import { AuthService } from './api/auth.service';
import { VehicleService } from './api/vehicle.service';
import { DriverService } from './api/driver.service';
import { BookingService } from './api/booking.service';
import { ReviewService } from './api/review.service';
import { AvailabilityService } from './api/availability.service';
import { AdminService } from './api/admin.service';
import { tokenStore } from './api/client';
import type {
  AuthResponse,
  User,
  Vehicle,
  DriverProfile,
  Booking,
  Review,
  Availability,
} from './api/types';

export { tokenStore };

export const authAPI = {
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    is_driver?: boolean;
    mobile_number?: string;
  }): Promise<AuthResponse> => AuthService.register(userData),
  login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    AuthService.login(credentials),
  logout: (): Promise<void> => AuthService.logout(),
  getProfile: (): Promise<User> => AuthService.me(),
  updateProfile: (data: Partial<User>): Promise<User> => AuthService.updateProfile(data),
  forgotPassword: (email: string): Promise<void> => AuthService.forgotPassword(email),
  resetPassword: (token: string, password: string, password_confirmation: string): Promise<void> =>
    AuthService.resetPassword({ token, email: '', password, password_confirmation }),
};

export const adminAuthAPI = {
  login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    AuthService.adminLogin(credentials),
  logout: (): Promise<void> => AuthService.logout(),
  getProfile: (): Promise<User> => AuthService.me(),
  updateProfile: (data: Partial<User>): Promise<User> => AuthService.updateProfile(data),
};

export const availabilityAPI = {
  getDriverAvailability: (driverId: string, startDate?: string, endDate?: string): Promise<Availability[]> =>
    AvailabilityService.getDriverAvailability(driverId, startDate, endDate),
  setDriverAvailability: (data: { driverId: string; dates: string[] }): Promise<void> =>
    AvailabilityService.setDriverAvailability(data.driverId, data.dates),
  updateAvailability: (id: string, data: Partial<Availability>): Promise<Availability> =>
    AvailabilityService.update(id, data),
  removeAvailability: (id: string): Promise<void> => AvailabilityService.remove(id),
  getCalendarView: (driverId: string): Promise<Availability[]> => AvailabilityService.getDriverAvailability(driverId),
};

export const adminAPI = {
  listAdmins: () => AdminService.listAdmins(),
  createAdmin: (adminData: { username: string; email: string; password: string; password_confirmation: string; role: string }) =>
    AdminService.createAdmin(adminData),
  updateAdmin: (id: string, data: Parameters<typeof AdminService.updateAdmin>[1]) =>
    AdminService.updateAdmin(id, data as Partial<import('./api/types').AdminUser>),
  deleteAdmin: (id: string) => AdminService.deleteAdmin(id),
  getDashboardStats: () => AdminService.getStats(),
  validateAdminCode: (_code: string): Promise<{ success: boolean }> =>
    Promise.resolve({ success: true }),
};

export const vehicleAPI = {
  listVehicles: (filters?: Parameters<typeof VehicleService.list>[0]): Promise<{ data: Vehicle[]; count: number }> =>
    VehicleService.list(filters ?? {}),
  registerVehicle: (vehicleData: Parameters<typeof VehicleService.create>[0]): Promise<Vehicle> =>
    VehicleService.create(vehicleData),
  getVehicle: (id: string): Promise<Vehicle | null> => VehicleService.getById(id),
  updateVehicle: (id: string, data: Partial<Vehicle>): Promise<Vehicle> => VehicleService.update(id, data),
  deleteVehicle: (id: string): Promise<void> => VehicleService.delete(id),
  uploadVehiclePhotos: (id: string, photos: FormData): Promise<Vehicle> => VehicleService.uploadPhotos(id, photos),
  getUserVehicles: (_userId: string): Promise<{ data: Vehicle[]; count: number }> => VehicleService.list(),
};

export const driverAPI = {
  listDrivers: (filters?: Parameters<typeof DriverService.list>[0]): Promise<{ data: DriverProfile[]; count: number }> =>
    DriverService.list(filters ?? {}),
  registerDriver: (driverData: Parameters<typeof DriverService.register>[0]): Promise<DriverProfile> =>
    DriverService.register(driverData),
  getDriver: (id: string): Promise<DriverProfile | null> => DriverService.getById(id),
  updateDriver: (id: string, data: Partial<DriverProfile>): Promise<DriverProfile> => DriverService.update(id, data),
  deleteDriver: (_id: string): Promise<void> => Promise.resolve(),
  uploadDriverDocuments: (id: string, documents: FormData): Promise<DriverProfile> =>
    DriverService.uploadDocuments(id, documents),
  getUserDriverApplications: (userId: string): Promise<DriverProfile | null> => DriverService.getByUserId(userId),
};

export const bookingAPI = {
  listBookings: (filters?: Parameters<typeof BookingService.listForUser>[1]): Promise<{ data: Booking[]; count: number }> =>
    BookingService.listForUser('', filters ?? {}),
  createBooking: (bookingData: Parameters<typeof BookingService.create>[0]): Promise<Booking> =>
    BookingService.create(bookingData),
  getBooking: (id: string): Promise<Booking | null> => BookingService.getById(id),
  updateBooking: (id: string, data: Partial<Booking>): Promise<Booking> =>
    VehicleService.update(id, data as Partial<Vehicle>).then(() => BookingService.getById(id)) as Promise<Booking>,
  cancelBooking: (id: string): Promise<void> => BookingService.cancel(id),
  processPayment: (_id: string, _paymentData: unknown): Promise<void> => Promise.resolve(),
};

export const reviewAPI = {
  listReviews: (): Promise<Review[]> => ReviewService.listAll().then((r) => r.data),
  submitReview: (reviewData: Parameters<typeof ReviewService.create>[0]): Promise<Review> =>
    ReviewService.create(reviewData),
  getReview: (_id: string): Promise<Review | null> => Promise.resolve(null),
  updateReview: (_id: string, _data: Partial<Review>): Promise<Review> =>
    Promise.reject(new Error('Not supported')),
  deleteReview: (id: string): Promise<void> => ReviewService.delete(id),
  uploadReviewPhotos: (_id: string, _photos: FormData): Promise<Review> =>
    Promise.reject(new Error('Not supported')),
  getTargetReviews: (type: 'vehicle' | 'driver', id: string): Promise<Review[]> =>
    type === 'vehicle' ? ReviewService.listForVehicle(id) : ReviewService.listForDriver(id),
};

export default authAPI;
