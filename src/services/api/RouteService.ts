import type { Coordinates } from './LocationService';

export interface RoutePoint { lat: number; lng: number }

export interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  distance: number;   // metres
  duration: number;   // seconds
  legs: Array<{
    steps: Array<{
      maneuver: { location: [number, number]; instruction?: string };
      name: string;
      distance: number;
      duration: number;
    }>;
  }>;
}

export interface RouteResult {
  primary: OsrmRoute;
  alternatives: OsrmRoute[];
  distanceKm: number;
  durationMin: number;
  durationLabel: string;
  polyline: RoutePoint[];           // primary route decoded
  altPolylines: RoutePoint[][];     // alternative routes decoded
}

export interface DeviationEvent {
  type: 'route_deviation' | 'speeding' | 'sudden_stop' | 'idle' | 'wrong_direction';
  severity: 'low' | 'medium' | 'high';
  message: string;
  detectedAt: Date;
  coords: Coordinates;
  distanceFromRoute?: number;      // metres
  speed?: number;                  // km/h
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

/** Decode OSRM GeoJSON coordinates to RoutePoint[] */
function decodeGeoJSON(coords: [number, number][]): RoutePoint[] {
  return coords.map(([lng, lat]) => ({ lat, lng }));
}

export class RouteService {
  /**
   * Fetch real road route(s) between two points using OSRM.
   * Returns primary + up to 2 alternative routes.
   */
  static async getRoute(from: Coordinates, to: Coordinates): Promise<RouteResult> {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM routing failed');
    const json = await res.json() as { routes: OsrmRoute[]; code: string };
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error('No route found');

    const [primary, ...alternatives] = json.routes;
    return {
      primary,
      alternatives,
      distanceKm: Math.round((primary.distance / 1000) * 10) / 10,
      durationMin: Math.round(primary.duration / 60),
      durationLabel: formatDuration(primary.duration),
      polyline: decodeGeoJSON(primary.geometry.coordinates),
      altPolylines: alternatives.map(r => decodeGeoJSON(r.geometry.coordinates)),
    };
  }

  /**
   * Snap driver position to the nearest point on the route polyline.
   * Returns distance from route (metres) and closest point index.
   */
  static snapToRoute(
    position: Coordinates,
    routePolyline: RoutePoint[]
  ): { distanceMetres: number; closestIndex: number; closestPoint: RoutePoint } {
    let minDist = Infinity;
    let closestIndex = 0;

    routePolyline.forEach((pt, i) => {
      const d = this.haversineMetres(position, pt);
      if (d < minDist) { minDist = d; closestIndex = i; }
    });

    return { distanceMetres: minDist, closestIndex, closestPoint: routePolyline[closestIndex] };
  }

  /** Haversine distance in metres */
  static haversineMetres(a: Coordinates, b: Coordinates): number {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  /**
   * Analyse current driver position against the planned route.
   * Returns a DeviationEvent if anomaly detected, null otherwise.
   */
  static analysePosition(
    current: Coordinates & { speed?: number; heading?: number; timestamp?: number },
    routePolyline: RoutePoint[],
    previousPositions: Array<Coordinates & { timestamp?: number }>,
    deviationThresholdMetres = 200,
    speedLimitKmh = 120,
    idleThresholdSeconds = 300,
  ): DeviationEvent | null {
    if (!routePolyline.length) return null;

    const { distanceMetres } = this.snapToRoute(current, routePolyline);

    // Route deviation
    if (distanceMetres > deviationThresholdMetres) {
      const severity = distanceMetres > 800 ? 'high' : distanceMetres > 400 ? 'medium' : 'low';
      return {
        type: 'route_deviation',
        severity,
        message: `Driver is ${Math.round(distanceMetres)}m off planned route`,
        detectedAt: new Date(),
        coords: current,
        distanceFromRoute: Math.round(distanceMetres),
      };
    }

    // Speed anomaly
    if (current.speed !== undefined && current.speed > speedLimitKmh) {
      return {
        type: 'speeding',
        severity: current.speed > 140 ? 'high' : 'medium',
        message: `Speed ${Math.round(current.speed)} km/h exceeds limit`,
        detectedAt: new Date(),
        coords: current,
        speed: current.speed,
      };
    }

    // Idle detection (no movement for threshold period)
    if (previousPositions.length >= 3 && current.timestamp) {
      const oldest = previousPositions[0];
      if (oldest.timestamp) {
        const idleSeconds = (current.timestamp - oldest.timestamp) / 1000;
        const totalMovement = previousPositions.reduce((acc, pos, i) => {
          if (i === 0) return acc;
          return acc + this.haversineMetres(previousPositions[i - 1], pos);
        }, 0);
        if (idleSeconds > idleThresholdSeconds && totalMovement < 50) {
          return {
            type: 'idle',
            severity: idleSeconds > 600 ? 'medium' : 'low',
            message: `Vehicle idle for ${Math.round(idleSeconds / 60)} minutes`,
            detectedAt: new Date(),
            coords: current,
          };
        }
      }
    }

    return null;
  }

  /**
   * Estimate progress percentage along the route.
   */
  static getRouteProgress(
    current: Coordinates,
    routePolyline: RoutePoint[]
  ): number {
    if (routePolyline.length < 2) return 0;
    const { closestIndex } = this.snapToRoute(current, routePolyline);
    return Math.round((closestIndex / (routePolyline.length - 1)) * 100);
  }
}
