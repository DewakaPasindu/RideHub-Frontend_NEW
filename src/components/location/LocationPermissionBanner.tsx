import React from 'react';
import { MapPin, AlertTriangle, RefreshCw, X, Navigation } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

interface Props {
  blocking?: boolean;
  onDismiss?: () => void;
}

export default function LocationPermissionBanner({ blocking = false, onDismiss }: Props) {
  const { permission, requestPermission } = useLocation();
  const [requesting, setRequesting] = React.useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  // Only render for denied state
  if (permission !== 'denied') return null;

  const openBrowserSettings = () => {
    // Best-effort: copy instructions to clipboard and alert user
    // (Browsers don't allow programmatic opening of settings pages)
    const msg = 'To enable location: click the lock/info icon in your browser address bar → Site settings → Location → Allow, then reload this page.';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    alert(msg);
  };

  if (blocking) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-5">
            <MapPin className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Location Access Required</h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            RideHub needs your location to show nearby vehicles and drivers, calculate routes, and provide accurate booking services.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your location is only used for this session and is never stored without your consent.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {requesting
                ? <><div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /><span>Requesting...</span></>
                : <><Navigation className="h-5 w-5" /><span>Enable Location Access</span></>
              }
            </button>
            <button
              onClick={openBrowserSettings}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              How to Enable in Settings
            </button>
          </div>
          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-left">
            <p className="text-xs font-semibold text-gray-600 mb-1">Manual steps:</p>
            <ol className="text-xs text-gray-500 space-y-0.5 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Select "Site settings" or "Permissions"</li>
              <li>Set Location to "Allow"</li>
              <li>Reload this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">Location access is required</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Enable GPS to find nearby vehicles and drivers. Click the lock icon in your address bar → Location → Allow.
        </p>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <button
          onClick={handleRequest}
          disabled={requesting}
          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${requesting ? 'animate-spin' : ''}`} />
          <span>Retry</span>
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="p-1.5 text-amber-600 hover:text-amber-800">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
