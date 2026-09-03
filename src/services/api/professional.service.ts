import api from './client';
import type {
  ProfessionalCapabilities,
  ProfessionalOverview,
  DriverAnalyticsData,
  VehicleOwnerAnalyticsData,
  EarningRecord,
  MonthlyStatement,
} from './types';

export interface EarningsFilterParams {
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PayFeePayload {
  amount: number;
  payment_method: 'card' | 'bank_transfer' | 'wallet' | 'cash';
  payment_reference?: string;
  notes?: string;
}

export class ProfessionalService {
  /**
   * Get user's dynamic capabilities.
   */
  static async getCapabilities(): Promise<ProfessionalCapabilities> {
    const response = await api.get('/professional/capabilities');
    return response.data.data;
  }

  /**
   * Get main professional overview (combined metrics, trend, recent earnings).
   */
  static async getOverview(): Promise<ProfessionalOverview> {
    const response = await api.get('/professional/dashboard');
    return response.data.data;
  }

  /**
   * Get Driver-specific analytics.
   */
  static async getDriverAnalytics(): Promise<DriverAnalyticsData> {
    const response = await api.get('/professional/driver/dashboard');
    return response.data.data;
  }

  /**
   * Get Vehicle Owner-specific analytics and fleet performance table.
   */
  static async getOwnerAnalytics(): Promise<VehicleOwnerAnalyticsData> {
    const response = await api.get('/professional/owner/dashboard');
    return response.data.data;
  }

  /**
   * Get paginated earnings history with search and filters.
   */
  static async getEarnings(params?: EarningsFilterParams): Promise<PaginatedResponse<EarningRecord>> {
    const response = await api.get('/professional/earnings', { params });
    return response.data.data;
  }

  /**
   * Get paginated monthly statements.
   */
  static async getStatements(page = 1, perPage = 12): Promise<PaginatedResponse<MonthlyStatement>> {
    const response = await api.get('/professional/statements', {
      params: { page, per_page: perPage },
    });
    return response.data.data;
  }

  /**
   * Get single statement details with itemized earnings.
   */
  static async getStatementDetails(uuid: string): Promise<{ statement: MonthlyStatement; itemized_earnings: EarningRecord[] }> {
    const response = await api.get(`/professional/statements/${uuid}`);
    return response.data.data;
  }

  /**
   * Settle platform fee for a statement.
   */
  static async payFee(uuid: string, payload: PayFeePayload): Promise<{ statement: MonthlyStatement; payment: any }> {
    const response = await api.post(`/professional/statements/${uuid}/pay-fee`, payload);
    return response.data.data;
  }

  /**
   * Admin platform financial overview.
   */
  static async getAdminFinancialOverview(): Promise<any> {
    const response = await api.get('/admin/financial-overview');
    return response.data.data;
  }
}
