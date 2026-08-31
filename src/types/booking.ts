export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  type: 'vehicle' | 'driver';
  targetId: string;
  targetName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  nearestTown?: string;
  acPreference?: string;
  paymentReceiptUrl?: string;
  advanceAmount?: number;
}

export interface BookingNotification {
  id: string;
  bookingId: string;
  recipientType: 'admin' | 'owner' | 'driver' | 'user';
  recipientId: string;
  type: 'new_booking' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  ownerId: string;
  targetId: string;
  targetType: 'vehicle' | 'driver';
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface BookingReview {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  targetType: 'vehicle' | 'driver';
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
}