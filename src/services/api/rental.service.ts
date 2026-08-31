import api, { unwrap, multipartConfig } from './client';

export interface RentalApplication {
  id: number;
  uuid: string;
  booking_id: number | null;
  customer_id: number;
  vehicle_id: number;
  status: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  id_type: 'nic' | 'passport';
  id_number: string;
  driving_license_number: string;
  license_expiry_date: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  return_address: string;
  return_latitude: number;
  return_longitude: number;
  start_at: string;
  end_at: string;
  passenger_count: number;
  luggage_requirement: 'light' | 'medium' | 'heavy';
  rental_purpose: string | null;
  additional_requirements: string | null;
  more_info_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  vehicle?: any;
  customer?: any;
  documents?: RentalDocument[];
  conditions?: RentalVehicleCondition[];
  handover?: RentalHandover | null;
}

export interface RentalDocument {
  id: number;
  uuid: string;
  rental_application_id: number;
  document_type: 'id_front' | 'id_back' | 'driving_license_front' | 'driving_license_back' | 'customer_live_photo';
  original_filename: string;
  mime_type: string;
  file_size: number;
  verification_status: string;
  uploaded_at: string;
  url: string;
}

export interface RentalVehicleCondition {
  id: number;
  uuid: string;
  rental_application_id: number;
  recorded_by: number;
  inspection_stage: 'pre_rental' | 'return';
  odometer_reading: number;
  fuel_level: number;
  exterior_condition: string | null;
  interior_condition: string | null;
  existing_damage: any | null;
  condition_description: string | null;
  created_at: string;
  photos?: RentalConditionPhoto[];
}

export interface RentalConditionPhoto {
  id: number;
  uuid: string;
  condition_id: number;
  photo_type: string;
  file_path: string;
  latitude: number | null;
  longitude: number | null;
  captured_at: string;
  url: string;
}

export interface RentalHandover {
  id: number;
  uuid: string;
  rental_application_id: number;
  status: string;
  customer_confirmed_at: string | null;
  owner_confirmed_at: string | null;
  handover_at: string | null;
  handover_latitude: number | null;
  handover_longitude: number | null;
  created_at: string;
}

export interface RentalLocation {
  rental_application_id: number;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
}

export const RentalService = {
  // Customer Applications
  async getApplications(): Promise<RentalApplication[]> {
    const res = await api.get('/rental-applications');
    return unwrap(res);
  },

  async createApplication(data: any): Promise<RentalApplication> {
    const res = await api.post('/rental-applications', data);
    return unwrap(res);
  },

  async getApplication(uuid: string): Promise<RentalApplication> {
    const res = await api.get(`/rental-applications/${uuid}`);
    return unwrap(res);
  },

  async updateApplication(uuid: string, data: any): Promise<RentalApplication> {
    const res = await api.put(`/rental-applications/${uuid}`, data);
    return unwrap(res);
  },

  async submitApplication(uuid: string): Promise<RentalApplication> {
    const res = await api.post(`/rental-applications/${uuid}/submit`);
    return unwrap(res);
  },

  async uploadDocument(uuid: string, type: string, file: File): Promise<RentalDocument> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    const res = await api.post(`/rental-applications/${uuid}/documents`, formData, multipartConfig());
    return unwrap(res);
  },

  async uploadLivePhoto(uuid: string, file: File): Promise<RentalDocument> {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post(`/rental-applications/${uuid}/live-photo`, formData, multipartConfig());
    return unwrap(res);
  },

  // Owner Actions
  async getOwnerRequests(): Promise<RentalApplication[]> {
    const res = await api.get('/owner/rental-requests');
    return unwrap(res);
  },

  async approveRequest(uuid: string): Promise<RentalApplication> {
    const res = await api.post(`/owner/rental-requests/${uuid}/approve`);
    return unwrap(res);
  },

  async rejectRequest(uuid: string, reason: string): Promise<RentalApplication> {
    const res = await api.post(`/owner/rental-requests/${uuid}/reject`, { reason });
    return unwrap(res);
  },

  async requestInformation(uuid: string, details: string): Promise<RentalApplication> {
    const res = await api.post(`/owner/rental-requests/${uuid}/request-information`, { details });
    return unwrap(res);
  },

  // Vehicle Conditions
  async getConditions(uuid: string): Promise<RentalVehicleCondition[]> {
    const res = await api.get(`/rentals/${uuid}/condition`);
    return unwrap(res);
  },

  async storeCondition(uuid: string, data: any): Promise<RentalVehicleCondition> {
    const res = await api.post(`/rentals/${uuid}/condition`, data);
    return unwrap(res);
  },

  async uploadConditionPhoto(
    uuid: string,
    conditionUuid: string,
    photoType: string,
    file: File,
    latitude?: number | null,
    longitude?: number | null
  ): Promise<any> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('condition_uuid', conditionUuid);
    formData.append('photo_type', photoType);
    if (latitude) formData.append('latitude', String(latitude));
    if (longitude) formData.append('longitude', String(longitude));

    const res = await api.post(`/rentals/${uuid}/condition/photos`, formData, multipartConfig());
    return unwrap(res);
  },

  async getComparison(uuid: string): Promise<{
    pre_rental: RentalVehicleCondition | null;
    return: RentalVehicleCondition | null;
    odometer_difference: number;
    fuel_difference: number;
  }> {
    const res = await api.get(`/rentals/${uuid}/condition-comparison`);
    return unwrap(res);
  },

  // Handover Confirmations
  async getHandover(uuid: string): Promise<RentalHandover> {
    const res = await api.get(`/rentals/${uuid}/handover`);
    return unwrap(res);
  },

  async confirmHandoverCustomer(uuid: string, latitude?: number, longitude?: number): Promise<RentalHandover> {
    const res = await api.post(`/rentals/${uuid}/handover/customer-confirm`, { latitude, longitude });
    return unwrap(res);
  },

  async confirmHandoverOwner(uuid: string, latitude?: number, longitude?: number): Promise<RentalHandover> {
    const res = await api.post(`/rentals/${uuid}/handover/owner-confirm`, { latitude, longitude });
    return unwrap(res);
  },

  // Location Tracking
  async pingLocation(uuid: string, latitude: number, longitude: number, accuracy?: number): Promise<RentalLocation> {
    const res = await api.post(`/rentals/${uuid}/location`, { latitude, longitude, accuracy });
    return unwrap(res);
  },

  async getLatestLocation(uuid: string): Promise<RentalLocation> {
    const res = await api.get(`/rentals/${uuid}/location/latest`);
    return unwrap(res);
  },

  async getLocationHistory(uuid: string): Promise<RentalLocation[]> {
    const res = await api.get(`/rentals/${uuid}/location/history`);
    return unwrap(res);
  },

  // Return Completion
  async completeReturn(uuid: string): Promise<RentalApplication> {
    const res = await api.post(`/rentals/${uuid}/return`);
    return unwrap(res);
  },
};
