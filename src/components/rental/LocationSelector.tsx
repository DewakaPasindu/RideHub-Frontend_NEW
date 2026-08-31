import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import InteractiveMap, { MapCoords } from '../map/InteractiveMap';
import { LocationService } from '../../services/api/LocationService';

interface LocationSelectorProps {
  pickup: MapCoords | null;
  destination: MapCoords | null;
  onChangePickup: (c: MapCoords) => void;
  onChangeDestination: (c: MapCoords) => void;
}

export default function LocationSelector({
  pickup,
  destination,
  onChangePickup,
  onChangeDestination,
}: LocationSelectorProps) {
  const [pickupQuery, setPickupQuery] = useState(pickup?.address || '');
  const [destQuery, setDestQuery] = useState(destination?.address || '');
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (pickup?.address) setPickupQuery(pickup.address);
  }, [pickup]);

  useEffect(() => {
    if (destination?.address) setDestQuery(destination.address);
  }, [destination]);

  const handleSearchPickup = async (val: string) => {
    setPickupQuery(val);
    if (val.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    try {
      const results = await LocationService.searchLocations(val);
      setPickupSuggestions(results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchDest = async (val: string) => {
    setDestQuery(val);
    if (val.length < 3) {
      setDestSuggestions([]);
      return;
    }
    try {
      const results = await LocationService.searchLocations(val);
      setDestSuggestions(results);
    } catch (err) {
      console.error(err);
    }
  };

  const selectPickup = (item: any) => {
    onChangePickup({
      lat: Number(item.lat),
      lng: Number(item.lng),
      address: item.display_name,
    });
    setPickupQuery(item.display_name);
    setPickupSuggestions([]);
  };

  const selectDest = (item: any) => {
    onChangeDestination({
      lat: Number(item.lat),
      lng: Number(item.lng),
      address: item.display_name,
    });
    setDestQuery(item.display_name);
    setDestSuggestions([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Search */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-blue-500" />
            <input
              type="text"
              value={pickupQuery}
              onChange={(e) => handleSearchPickup(e.target.value)}
              placeholder="Type pickup location (e.g. Malabe)"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {pickupSuggestions.length > 0 && (
            <div className="absolute z-55 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {pickupSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectPickup(item)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
          {pickup && (
            <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
              Coordinates: <span className="font-mono text-slate-500">{pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)}</span>
            </p>
          )}
        </div>

        {/* Dropoff Search */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Return / Drop-off Location
          </label>
          <div className="relative">
            <Navigation className="absolute left-3 top-3.5 h-4.5 w-4.5 text-red-500" />
            <input
              type="text"
              value={destQuery}
              onChange={(e) => handleSearchDest(e.target.value)}
              placeholder="Type drop-off location"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {destSuggestions.length > 0 && (
            <div className="absolute z-55 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {destSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDest(item)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center space-x-2"
                >
                  <Navigation className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
          {destination && (
            <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
              Coordinates: <span className="font-mono text-slate-500">{destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}</span>
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600">Select Locations on Map</span>
          <span className="text-[10px] text-slate-500">Click & confirm (OK) to set pins</span>
        </div>
        <InteractiveMap
          mode="route"
          pickup={pickup}
          destination={destination}
          onPickupChange={(c) => {
            // Reverse geocode to get nice address text if empty
            if (!c.address) {
              LocationService.reverseGeocode(c.lat, c.lng)
                .then(res => onChangePickup({ ...c, address: res.display_name }))
                .catch(() => onChangePickup({ ...c, address: `Coordinates: ${c.lat}, ${c.lng}` }));
            } else {
              onChangePickup(c);
            }
          }}
          onDestinationChange={(c) => {
            if (!c.address) {
              LocationService.reverseGeocode(c.lat, c.lng)
                .then(res => onChangeDestination({ ...c, address: res.display_name }))
                .catch(() => onChangeDestination({ ...c, address: `Coordinates: ${c.lat}, ${c.lng}` }));
            } else {
              onChangeDestination(c);
            }
          }}
          height="320px"
        />
      </div>
    </div>
  );
}
