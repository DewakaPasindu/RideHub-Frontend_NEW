// Backward-compatibility shim — delegates to the new Laravel AI service.
import { AIService as LaravelAIService } from './ai.service';
import type {
  VehicleRecommendation,
  DriverMatch,
  ChatMessage,
  ChatResponse,
  Vehicle,
  DriverProfile,
  Coordinates,
} from './types';

export type {
  VehicleRecommendation,
  DriverMatch,
  ChatMessage,
  ChatResponse,
  Vehicle,
  DriverProfile,
  Coordinates,
};

export type VehicleRecommendationRequest = Parameters<typeof LaravelAIService.getVehicleRecommendations>[0];
export type DriverMatchRequest = Parameters<typeof LaravelAIService.getDriverMatches>[0];
export type TripInfo = NonNullable<ChatResponse['trip_info']>;
export type { TripRequest, TripAnalysis } from './ai.service';

export class AIService extends LaravelAIService {}
