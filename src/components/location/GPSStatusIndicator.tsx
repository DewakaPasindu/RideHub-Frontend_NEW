import React from 'react';
import { MapPin, Navigation, Wifi, WifiOff, Loader } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

export default function GPSStatusIndicator() {
  const { permission, coords, address, requestPermission } = useLocation();
  const [requesting, setRequesting] = React.useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  if (permission === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-blue-600 text-sm">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Getting location...</span>
      </div>
    );
  }

  if (permission === 'granted' && coords) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm group relative">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <Navigation className="h-4 w-4" />
        <span className="hidden sm:block truncate max-w-[160px]" title={address}>
          {address ? address.split(',')[0] : `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
        </span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <button onClick={handleRequest} disabled={requesting} className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm transition-colors">
        <WifiOff className="h-4 w-4" />
        <span>Location off — tap to enable</span>
      </button>
    );
  }

  if (permission === 'unknown') {
    return (
      <button onClick={handleRequest} disabled={requesting} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 text-sm transition-colors">
        <MapPin className="h-4 w-4" />
        <span>Enable Location</span>
      </button>
    );
  }

  return null;
}
