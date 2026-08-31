import type { MapCoords } from '../components/map/InteractiveMap';

export interface LocationUpdate {
  entity_id: string;
  entity_type: 'driver' | 'vehicle';
  coords: MapCoords;
  heading?: number;
  speed?: number;
  timestamp: string;
}

type LocationHandler = (update: LocationUpdate) => void;

/**
 * WebSocket-ready location tracking service.
 * Currently polls the Laravel API; upgrade to Pusher/Echo by swapping connect().
 */
export class RealtimeTrackingService {
  private static socket: WebSocket | null = null;
  private static handlers: Map<string, LocationHandler[]> = new Map();
  private static pollIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  /**
   * Connect to Laravel Broadcasting (Pusher/Reverb).
   * Call this once app-wide when user is authenticated.
   */
  static connect(wsUrl: string, authToken: string) {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${authToken}`);
      this.socket.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as LocationUpdate;
          this.emit(update.entity_id, update);
        } catch { /* malformed message */ }
      };
      this.socket.onerror = () => { this.socket = null; };
      this.socket.onclose = () => { this.socket = null; };
    } catch { /* WebSocket not available in this environment */ }
  }

  static disconnect() {
    this.socket?.close();
    this.socket = null;
    this.pollIntervals.forEach(i => clearInterval(i));
    this.pollIntervals.clear();
  }

  /**
   * Subscribe to location updates for a specific entity.
   * Falls back to polling the REST API when WebSocket is unavailable.
   */
  static subscribe(
    entityId: string,
    entityType: 'driver' | 'vehicle',
    handler: LocationHandler,
    pollFn?: () => Promise<MapCoords | null>
  ): () => void {
    const existing = this.handlers.get(entityId) ?? [];
    this.handlers.set(entityId, [...existing, handler]);

    // Start polling fallback if WS not connected and pollFn provided
    if (!this.socket && pollFn && !this.pollIntervals.has(entityId)) {
      const interval = setInterval(async () => {
        const coords = await pollFn().catch(() => null);
        if (coords) {
          this.emit(entityId, { entity_id: entityId, entity_type: entityType, coords, timestamp: new Date().toISOString() });
        }
      }, 5000);
      this.pollIntervals.set(entityId, interval);
    }

    return () => this.unsubscribe(entityId, handler);
  }

  static unsubscribe(entityId: string, handler: LocationHandler) {
    const handlers = this.handlers.get(entityId) ?? [];
    const remaining = handlers.filter(h => h !== handler);
    if (remaining.length === 0) {
      this.handlers.delete(entityId);
      const interval = this.pollIntervals.get(entityId);
      if (interval) { clearInterval(interval); this.pollIntervals.delete(entityId); }
    } else {
      this.handlers.set(entityId, remaining);
    }
  }

  private static emit(entityId: string, update: LocationUpdate) {
    (this.handlers.get(entityId) ?? []).forEach(h => h(update));
  }

  /**
   * Send driver's own location to the backend.
   * Called from the driver's device during an active trip.
   */
  static sendLocation(driverProfileId: string, coords: MapCoords) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'location_update',
        driver_profile_id: driverProfileId,
        ...coords,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}
