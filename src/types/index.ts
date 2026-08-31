export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: 'car' | 'van' | 'truck' | 'suv';
  pricePerDay: number;
  images: string[];
  status: 'available' | 'pending' | 'rented' | 'rejected';
  features: string[];
  ownerId: string;
}

export interface Driver {
  id: string;
  name: string;
  age: number;
  experience: number;
  license: string;
  photo: string;
  status: 'available' | 'pending' | 'rejected';
  rating: number;
  specialties: string[];
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePhoto?: string;
  mobileNumber?: string;
  address?: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  profilePhoto?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetType: 'vehicle' | 'driver';
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReviewFormData {
  targetType: 'vehicle' | 'driver';
  targetId: string;
  rating: number;
  comment: string;
  photos: File[];
}