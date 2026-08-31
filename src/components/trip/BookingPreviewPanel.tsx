import React from 'react';
import { CheckCircle, MapPin, Ruler, Clock, Car, User, Wallet, Calendar, ChevronRight, Zap, CreditCard as Edit2 } from 'lucide-react';
import type { TripFormValues } from './TripSearchPanel';
import type { TripAnalysis } from '../../services/api/TripSearchService';
import type { Vehicle } from '../../services/api/VehicleService';
import type { DriverProfile } from '../../services/api/DriverService';

interface Props {
  tripForm: TripFormValues;
  analysis: TripAnalysis;
  selectedVehicle: Vehicle | null;
  selectedDriver: DriverProfile | null;
  onEdit: (step: 'trip' | 'vehicle' | 'driver') => void;
  onConfirm: () => void;
  confirming?: boolean;
}

const VEHICLE_PLACEHOLDER = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80';
const DRIVER_PLACEHOLDER = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: React.FC<{className?: string}> }) {
  return (
    <div className="flex items-center space-x-3 py-2.5 border-b border-gray-100 last:border-0">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-500 flex-shrink-0 w-36">{label}</span>
      <span className="text-sm font-semibold text-gray-800 flex-1 text-right">{value}</span>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, onEdit }: { title: string; icon: React.FC<{className?: string}>; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h4>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
          <Edit2 className="h-3 w-3" /><span>Edit</span>
        </button>
      )}
    </div>
  );
}

export default function BookingPreviewPanel({ tripForm, analysis, selectedVehicle, selectedDriver, onEdit, onConfirm, confirming }: Props) {
  const vehicleName = selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : '—';
  const driverName = selectedDriver?.user
    ? `${selectedDriver.user.first_name} ${selectedDriver.user.last_name}`
    : selectedDriver ? 'Driver assigned' : 'No driver';

  const tripDays = tripForm.trip_date ? 1 : 1;
  const estimatedTotal = selectedVehicle
    ? selectedVehicle.price_per_day * tripDays
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="h-5 w-5 text-yellow-300" />
          <h3 className="font-bold text-lg">Booking Summary</h3>
        </div>
        <p className="text-blue-200 text-sm">Review your trip details before confirming</p>
      </div>

      {/* Route section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Route" icon={MapPin} onEdit={() => onEdit('trip')} />
        <div className="space-y-3">
          <div className="flex items-start space-x-3 bg-blue-50 rounded-xl p-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div>
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="text-sm font-semibold text-gray-900">{tripForm.pickup?.address ?? '—'}</p>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-gray-300" /></div>
          <div className="flex items-start space-x-3 bg-red-50 rounded-xl p-3">
            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">B</div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="text-sm font-semibold text-gray-900">{tripForm.destination?.address ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Ruler className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-sm font-bold text-gray-800">{analysis.distance_km} km</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Clock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Est. Duration</p>
            <p className="text-sm font-bold text-gray-800">{analysis.estimated_hours_label}</p>
          </div>
        </div>
      </div>

      {/* Trip details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Trip Details" icon={Calendar} onEdit={() => onEdit('trip')} />
        <Row icon={Calendar} label="Date" value={new Date(tripForm.trip_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })} />
        <Row icon={User} label="Passengers" value={`${tripForm.passenger_count} person${tripForm.passenger_count > 1 ? 's' : ''}`} />
        <Row icon={Wallet} label="Budget/day" value={`LKR ${tripForm.budget.toLocaleString()}`} />
        <Row icon={Car} label="Luggage" value={`${tripForm.luggage_size.charAt(0).toUpperCase()}${tripForm.luggage_size.slice(1)}`} />
      </div>

      {/* Selected vehicle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Selected Vehicle" icon={Car} onEdit={() => onEdit('vehicle')} />
        {selectedVehicle ? (
          <div className="flex items-center space-x-4">
            <img
              src={selectedVehicle.images?.[0] || VEHICLE_PLACEHOLDER}
              alt={vehicleName}
              className="h-16 w-20 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = VEHICLE_PLACEHOLDER; }}
            />
            <div className="flex-1">
              <p className="font-bold text-gray-900">{vehicleName}</p>
              <p className="text-sm text-gray-500">{selectedVehicle.year} · {selectedVehicle.seat_count} seats · {selectedVehicle.vehicle_type}</p>
              <p className="text-blue-600 font-bold mt-1">LKR {selectedVehicle.price_per_day.toLocaleString()}<span className="text-xs font-normal text-gray-400">/day</span></p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-2">No vehicle selected</p>
        )}
      </div>

      {/* Selected driver */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Assigned Driver" icon={User} onEdit={() => onEdit('driver')} />
        {selectedDriver ? (
          <div className="flex items-center space-x-4">
            <img
              src={selectedDriver.profile_photo || DRIVER_PLACEHOLDER}
              alt={driverName}
              className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = DRIVER_PLACEHOLDER; }}
            />
            <div>
              <p className="font-bold text-gray-900">{driverName}</p>
              <p className="text-sm text-gray-500">{selectedDriver.experience_years}y experience · ⭐ {selectedDriver.rating.toFixed(1)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No driver assigned</p>
        )}
      </div>

      {/* Cost estimate */}
      {estimatedTotal !== null && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-800">Estimated Total</p>
              <p className="text-xs text-emerald-600 mt-0.5">Based on {tripDays} day(s)</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-700">LKR {estimatedTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-800">AI Recommendation Summary</p>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed">
          Based on your {analysis.passengers}-passenger trip over {analysis.distance_km} km
          {selectedVehicle ? `, the ${selectedVehicle.brand} ${selectedVehicle.model} provides the best fit` : ''}.
          {selectedDriver?.user ? ` ${selectedDriver.user.first_name} has been matched as your driver.` : ''}
          {' '}Estimated travel time: {analysis.estimated_hours_label}.
        </p>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={!selectedVehicle || confirming}
        className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base transition-colors shadow-md"
      >
        {confirming ? (
          <><div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Creating Booking...</span></>
        ) : (
          <><CheckCircle className="h-5 w-5" /><span>Confirm Booking</span><ChevronRight className="h-5 w-5" /></>
        )}
      </button>
      {!selectedVehicle && <p className="text-center text-xs text-gray-400">Select a vehicle to continue</p>}
    </div>
  );
}
