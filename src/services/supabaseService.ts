// Legacy shim — all auth/availability logic now lives in src/services/api/
// (Laravel 12 + Sanctum). This file is retained only so legacy imports
// don't break during the migration.
export { AuthService as SupabaseAuthService } from './api/auth.service';
export { AvailabilityService as SupabaseAvailabilityService } from './availabilityService';
export { AdminService as SupabaseAdminService } from './api/admin.service';
