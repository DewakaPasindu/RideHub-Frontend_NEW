import React from 'react';

export type PermissionState = 'unknown' | 'checking' | 'granted' | 'denied' | 'unsupported';

export interface LocationContext {
  permission: PermissionState;
  coords: { lat: number; lng: number } | null;
  address: string;
  requestPermission: () => Promise<boolean>;
  isReady: boolean;
}

const Ctx = React.createContext<LocationContext | undefined>(undefined);

const LOCATION_KEY = 'ridehub_location_permission';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = React.useState<PermissionState>('unknown');
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = React.useState('');

  const acquire = React.useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) { setPermission('unsupported'); resolve(false); return; }
      setPermission('checking');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          setPermission('granted');
          localStorage.setItem(LOCATION_KEY, 'granted');
          // Reverse geocode quietly
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${c.lat}&lon=${c.lng}&format=json`);
            const j = await res.json() as { display_name?: string };
            setAddress(j.display_name ?? `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
          } catch { setAddress(`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`); }
          resolve(true);
        },
        () => { setPermission('denied'); localStorage.removeItem(LOCATION_KEY); resolve(false); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  React.useEffect(() => {
    if (!navigator.geolocation) { setPermission('unsupported'); return; }
    // If previously granted, silently re-acquire
    if (localStorage.getItem(LOCATION_KEY) === 'granted') { acquire(); return; }
    // Use the Permissions API if available
    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') acquire();
      else if (result.state === 'denied') setPermission('denied');
      else setPermission('unknown');
    }).catch(() => setPermission('unknown'));
  }, [acquire]);

  return (
    <Ctx.Provider value={{ permission, coords, address, requestPermission: acquire, isReady: permission === 'granted' }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocation() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
