import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Square, Compass, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';

export default function CustomerActiveRental() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<RentalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [statusText, setStatusText] = useState('Awaiting GPS...');
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const loadApp = async () => {
    if (!id) return;
    try {
      const data = await RentalService.getApplication(id);
      setApp(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApp();
    return () => {
      stopTracking();
    };
  }, [id]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (coords && mapRef.current && !mapInstance.current) {
      import('leaflet').then((L) => {
        const map = L.map(mapRef.current!, {
          center: [coords.lat, coords.lng],
          zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        marker.bindPopup('Your Current Location').openPopup();

        mapInstance.current = map;
        markerInstance.current = marker;
      });
    } else if (coords && mapInstance.current && markerInstance.current) {
      markerInstance.current.setLatLng([coords.lat, coords.lng]);
      mapInstance.current.setView([coords.lat, coords.lng]);
    }
  }, [coords]);

  const startTracking = () => {
    if (!id) return;
    setError(null);
    if (navigator.geolocation) {
      setTrackingActive(true);
      setStatusText('GPS Active');

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });

          // Send GPS coordinate ping to the backend
          try {
            await RentalService.pingLocation(id, lat, lng, position.coords.accuracy || undefined);
          } catch (err) {
            console.error("Failed to ping location:", err);
          }
        },
        (err) => {
          console.error("GPS Watch error:", err);
          setError("Failed to get GPS location. Please check your system/browser location settings.");
          setStatusText('GPS Error');
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      setError("Geolocation is not supported by this device.");
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingActive(false);
    setStatusText('Tracking Stopped');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading active rental profile...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
        Active rental not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <Link to={`/customer/rentals/${app.uuid}`} className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Rental details</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-400">GPS Link:</span>
          <span className={`px-3 py-1 rounded-full font-black uppercase text-[10px] ${
            trackingActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tracking control panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-800 mb-2">Trip Progress Monitoring</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Click Start to enable active GPS tracking. This broadcasts safety telemetry to the vehicle owner for insurance verification.
            </p>

            <div className="space-y-3.5 mb-6 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
                <span>Return due: <strong>{new Date(app.end_at).toLocaleDateString()} @ {new Date(app.end_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4.5 w-4.5 text-slate-400" />
                <span>Return point: <strong className="truncate block max-w-[200px]">{app.return_address}</strong></span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {!trackingActive ? (
              <button
                type="button"
                onClick={startTracking}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Play className="h-4 w-4" />
                <span>Start GPS Broadcast</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopTracking}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                <Square className="h-4 w-4" />
                <span>Stop GPS Broadcast</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Map Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center space-x-2">
            <Compass className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-xs font-bold text-slate-600">Active Live Location Map</span>
          </div>
          {coords ? (
            <div ref={mapRef} style={{ height: '350px' }} />
          ) : (
            <div className="h-[350px] flex items-center justify-center bg-slate-100/50 text-xs text-slate-400 italic">
              Awaiting coordinates. Click Start GPS Broadcast to initialize tracking map.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
