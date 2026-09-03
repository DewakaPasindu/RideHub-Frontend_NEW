import api from './client';

export interface PlatformStats {
  happy_customers: number;
  vehicles_available: number;
  professional_drivers: number;
  cities_served: number;
  average_rating: number;
  total_reviews: number;
}

export interface PlatformTestimonial {
  id: string;
  name: string;
  role: string;
  image: string | null;
  quote: string;
  rating: number;
  created_at: string;
  is_real: boolean;
}

export interface PlatformOverview {
  stats: PlatformStats;
  testimonials: PlatformTestimonial[];
}

export class PlatformService {
  static async getOverview(): Promise<PlatformOverview> {
    const response = await api.get<{ success: boolean; data: PlatformOverview }>('/platform/overview');
    return response.data.data;
  }
}

export default PlatformService;
