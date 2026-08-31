// Application constants

export const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const VEHICLE_TYPES = {
  CAR: 'car',
  SUV: 'suv',
  VAN: 'van',
  TRUCK: 'truck'
} as const;

export const SRI_LANKAN_TOWNS = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
  'Polonnaruwa', 'Batticaloa', 'Trincomalee', 'Matara', 'Ratnapura', 
  'Badulla', 'Kurunegala', 'Puttalam', 'Kalutara', 'Nuwara Eliya',
  'Hambantota', 'Vavuniya', 'Mannar', 'Ampara'
];

export const VEHICLE_FEATURES = [
  'Air Conditioning',
  'GPS Navigation',
  'Bluetooth',
  'USB Charging',
  'WiFi Hotspot',
  'Backup Camera',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'Premium Sound System',
  'Cruise Control',
  'Parking Sensors',
  'Automatic Transmission',
  'Manual Transmission',
  'All-Wheel Drive',
  'Fuel Efficient',
  'Electric Vehicle',
  'Hybrid Engine'
];

export const DRIVER_SPECIALTIES = [
  'Luxury Vehicles',
  'Commercial Vehicles',
  'Off-road Specialist',
  'Tour Guide',
  'Long Distance',
  'City Expert',
  'Airport Transfers',
  'Wedding Events',
  'Corporate Travel',
  'Adventure Tours',
  'Mountain Driving',
  'Night Driving'
];

export const LANGUAGES = [
  'English', 'Sinhala', 'Tamil', 'Hindi', 'Arabic', 'Chinese', 
  'French', 'German', 'Japanese', 'Korean', 'Spanish', 'Italian'
];

export const VEHICLE_CLASSES = [
  { id: 'A1', name: 'Light Motor Cycles (≤100CC)' },
  { id: 'A', name: 'Motorcycles (>100CC)' },
  { id: 'B1', name: 'Motor Tricycle or Van' },
  { id: 'B', name: 'Dual Purpose Motor Vehicle' },
  { id: 'C1', name: 'Light Motor Lorry' },
  { id: 'C', name: 'Motor Lorry' },
  { id: 'CE', name: 'Heavy Motor Lorry with Trailer' },
  { id: 'D1', name: 'Light Motor Coach' },
  { id: 'D', name: 'Motor Coach' },
  { id: 'DE', name: 'Heavy Motor Coach' },
  { id: 'G1', name: 'Hand Tractors' },
  { id: 'G', name: 'Land Vehicle (Agricultural)' },
  { id: 'J', name: 'Special Purpose Vehicle' }
];

export const BANK_DETAILS = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "RideHub (Pvt) Ltd",
  accountNumber: "8001234567890",
  branch: "Colombo Main Branch",
  swiftCode: "CCEYLKLX"
};

export const PAYMENT_CONFIG = {
  ADVANCE_PERCENTAGE: 0.3, // 30% advance payment
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_RECEIPT_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
};

export const ADMIN_EMAILS = [
  'admin@ridehub.com',
  'superadmin@ridehub.com',
  'manager@ridehub.com'
];