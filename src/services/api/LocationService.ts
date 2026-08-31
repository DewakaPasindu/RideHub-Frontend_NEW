// Backward-compatibility shim — delegates to the new Laravel location service.
import { LocationService as LaravelLocationService } from './location.service';
import type { Coordinates, LocationSuggestion, ReverseGeocodeResult } from './types';

export type { Coordinates, LocationSuggestion, ReverseGeocodeResult };

export class LocationService extends LaravelLocationService {}
