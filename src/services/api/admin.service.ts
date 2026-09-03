import api from './client';

export interface SystemStatusData {
  api: string;
  database: string;
  cache: string;
  gps_services: string;
  payments: string;
  notifications: string;
  timestamp: string;
}

export interface CommandCenterData {
  system_status: SystemStatusData;
  overview: {
    total_users: number;
    active_drivers: number;
    approved_vehicles: number;
    vehicle_owners: number;
    online_drivers: number;
    active_trips: number;
    active_rentals: number;
    today_rides: number;
    today_rentals: number;
  };
  financial: {
    today_revenue: number;
    this_month_revenue: number;
    this_month_fees: number;
    total_gross: number;
    total_platform_fees: number;
    total_net_distributed: number;
    fees_collected: number;
    fees_outstanding: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    count: number;
    link: string;
  }>;
  action_queue: Array<{
    id: string;
    type: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    entity: string;
    details: string;
    created_at: string;
    status: string;
    action_label: string;
    action_url: string;
  }>;
  recent_activity: Array<{
    id: number;
    action: string;
    description: string;
    user: string;
    ip_address?: string;
    created_at: string;
    timestamp: string;
  }>;
  insights: Array<{
    type: string;
    trend: 'positive' | 'neutral' | 'warning';
    title: string;
    description: string;
  }>;
}

export interface LiveOperationsData {
  drivers: Array<{
    id: number;
    uuid: string;
    name: string;
    phone: string;
    driving_license: string;
    availability_status: string;
    is_online: boolean;
    rating: number;
    lat: number;
    lng: number;
    last_active: string;
    current_trip: any;
  }>;
  vehicles: Array<{
    id: number;
    uuid: string;
    make: string;
    model: string;
    registration_number: string;
    vehicle_type: string;
    status: 'available' | 'rented' | 'in_use' | 'maintenance';
    price_per_day: number;
    owner: string;
    owner_phone?: string;
    active_service?: string;
  }>;
  active_rides: Array<any>;
  active_rentals: Array<{
    id: number;
    uuid: string;
    customer: string;
    customer_phone: string;
    customer_email: string;
    vehicle: string;
    pickup_address: string;
    return_address: string;
    start_at: string;
    end_at: string;
    starting_odometer: number;
    daily_rate: number;
    is_overdue: boolean;
    status: string;
  }>;
  counts: {
    online_drivers: number;
    available_vehicles: number;
    rented_vehicles: number;
    active_trips: number;
    active_rentals: number;
    overdue_rentals: number;
  };
}

export interface ComplaintRecord {
  id: number;
  uuid: string;
  ticket_number: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'under_investigation' | 'awaiting_information' | 'resolved' | 'rejected' | 'closed';
  title: string;
  description: string;
  user?: { first_name: string; last_name: string; email: string; phone?: string };
  driver?: { first_name: string; last_name: string; phone: string };
  vehicle?: { make: string; model: string; registration_number: string };
  booking?: { uuid: string; pickup_location: string; dropoff_location: string };
  assigned_admin?: { first_name: string; last_name: string };
  admin_notes?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export class AdminService {
  // Command Center
  static async getCommandCenter(): Promise<CommandCenterData> {
    const res = await api.get('/admin/command-center');
    return res.data?.data;
  }

  // Global Multi-Entity Search
  static async search(query: string): Promise<any> {
    const res = await api.get('/admin/search', { params: { q: query } });
    return res.data?.data;
  }

  // Live Operations & Map
  static async getLiveOperations(): Promise<LiveOperationsData> {
    const res = await api.get('/admin/live/overview');
    return res.data?.data;
  }

  static async getMapMarkers(): Promise<{ markers: any[]; center: { lat: number; lng: number } }> {
    const res = await api.get('/admin/live/map');
    return res.data?.data;
  }

  // Drivers
  static async getDrivers(params: any = {}): Promise<any> {
    const res = await api.get('/admin/drivers', { params });
    return res.data?.data;
  }

  static async getDriver(uuid: string): Promise<any> {
    const res = await api.get(`/admin/drivers/${uuid}`);
    return res.data?.data;
  }

  static async approveDriver(uuid: string, notes?: string): Promise<any> {
    const res = await api.post(`/admin/drivers/${uuid}/approve`, { notes });
    return res.data?.data;
  }

  static async rejectDriver(uuid: string, reason: string): Promise<any> {
    const res = await api.post(`/admin/drivers/${uuid}/reject`, { reason });
    return res.data?.data;
  }

  static async requestDriverMoreInfo(uuid: string, notes: string): Promise<any> {
    const res = await api.post(`/admin/drivers/${uuid}/more-info`, { notes });
    return res.data?.data;
  }

  static async suspendDriver(uuid: string, reason: string): Promise<any> {
    const res = await api.post(`/admin/drivers/${uuid}/suspend`, { reason });
    return res.data?.data;
  }

  // Vehicles
  static async getVehicles(params: any = {}): Promise<any> {
    const res = await api.get('/admin/vehicles', { params });
    return res.data?.data;
  }

  static async getVehicle(uuid: string): Promise<any> {
    const res = await api.get(`/admin/vehicles/${uuid}`);
    return res.data?.data;
  }

  static async approveVehicle(uuid: string, notes?: string): Promise<any> {
    const res = await api.post(`/admin/vehicles/${uuid}/approve`, { notes });
    return res.data?.data;
  }

  static async rejectVehicle(uuid: string, reason: string): Promise<any> {
    const res = await api.post(`/admin/vehicles/${uuid}/reject`, { reason });
    return res.data?.data;
  }

  static async requestVehicleMoreInfo(uuid: string, notes: string): Promise<any> {
    const res = await api.post(`/admin/vehicles/${uuid}/more-info`, { notes });
    return res.data?.data;
  }

  static async suspendVehicle(uuid: string, reason: string): Promise<any> {
    const res = await api.post(`/admin/vehicles/${uuid}/suspend`, { reason });
    return res.data?.data;
  }

  // Self-Drive Rentals
  static async getRentals(params: any = {}): Promise<any> {
    const res = await api.get('/admin/rentals', { params });
    return res.data?.data;
  }

  static async getRental(uuid: string): Promise<any> {
    const res = await api.get(`/admin/rentals/${uuid}`);
    return res.data?.data;
  }

  // Complaints & Safety
  static async getComplaints(params: any = {}): Promise<any> {
    const res = await api.get('/admin/complaints', { params });
    return res.data?.data;
  }

  static async getComplaint(uuid: string): Promise<ComplaintRecord> {
    const res = await api.get(`/admin/complaints/${uuid}`);
    return res.data?.data;
  }

  static async assignComplaint(uuid: string, assignedTo: number): Promise<any> {
    const res = await api.post(`/admin/complaints/${uuid}/assign`, { assigned_to: assignedTo });
    return res.data?.data;
  }

  static async updateComplaintStatus(uuid: string, status: string, adminNotes?: string): Promise<any> {
    const res = await api.post(`/admin/complaints/${uuid}/status`, { status, admin_notes: adminNotes });
    return res.data?.data;
  }

  static async resolveComplaint(uuid: string, resolutionNotes: string): Promise<any> {
    const res = await api.post(`/admin/complaints/${uuid}/resolve`, { resolution_notes: resolutionNotes });
    return res.data?.data;
  }

  // Users
  static async getUsers(params: any = {}): Promise<any> {
    const res = await api.get('/admin/users', { params });
    return res.data?.data;
  }

  static async getUser(uuid: string): Promise<any> {
    const res = await api.get(`/admin/users/${uuid}`);
    return res.data?.data;
  }

  static async updateUserStatus(uuid: string, status: string, reason: string): Promise<any> {
    const res = await api.post(`/admin/users/${uuid}/status`, { status, reason });
    return res.data?.data;
  }

  // Financial & Analytics
  static async getFinancialOverview(): Promise<any> {
    const res = await api.get('/admin/financial-overview');
    return res.data?.data;
  }

  static async getAnalytics(): Promise<any> {
    const res = await api.get('/admin/analytics/overview');
    return res.data?.data;
  }

  static async getDemandAnalytics(): Promise<any> {
    const res = await api.get('/admin/analytics/demand');
    return res.data?.data;
  }

  // Reports
  static async generateReport(type: string): Promise<any> {
    const res = await api.get('/admin/reports/generate', { params: { type } });
    return res.data?.data;
  }

  // Audit Logs
  static async getAuditLogs(params: any = {}): Promise<any> {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data?.data;
  }

  // System Health
  static async getSystemHealth(): Promise<any> {
    const res = await api.get('/admin/system-health');
    return res.data?.data;
  }
}