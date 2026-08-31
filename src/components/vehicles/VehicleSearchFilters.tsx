import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface VehicleFilterState {
  search: string;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  has_ac: string;
  nearest_town: string;
  min_price: string;
  max_price: string;
  min_seats: string;
  sort: string;
}

const defaultFilters: VehicleFilterState = {
  search: '', vehicle_type: '', fuel_type: '', transmission: '',
  has_ac: '', nearest_town: '', min_price: '', max_price: '', min_seats: '', sort: 'created_at_desc'
};

interface Props {
  filters: VehicleFilterState;
  onChange: (f: VehicleFilterState) => void;
}

const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];

export { defaultFilters };

export default function VehicleSearchFilters({ filters, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const set = (key: keyof VehicleFilterState, value: string) => onChange({ ...filters, [key]: value });
  const hasActive = Object.entries(filters).some(([k, v]) => k !== 'sort' && v !== '');
  const reset = () => onChange(defaultFilters);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by brand, model, vehicle number..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={filters.sort} onChange={e => set('sort', e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="created_at_desc">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="year_desc">Year: Newest</option>
        </select>
        <button onClick={() => setOpen(!open)} className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${hasActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters{hasActive ? ' (active)' : ''}</span>
        </button>
        {hasActive && (
          <button onClick={reset} className="flex items-center space-x-1 px-3 py-2.5 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={filters.vehicle_type} onChange={e => set('vehicle_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Types</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="minibus">Minibus</option>
              <option value="bus">Bus</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fuel</label>
            <select value={filters.fuel_type} onChange={e => set('fuel_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Fuel Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
            <select value={filters.transmission} onChange={e => set('transmission', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">AC</label>
            <select value={filters.has_ac} onChange={e => set('has_ac', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Any</option>
              <option value="true">With AC</option>
              <option value="false">Without AC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nearest Town</label>
            <select value={filters.nearest_town} onChange={e => set('nearest_town', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Locations</option>
              {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Seats</label>
            <input type="number" min="1" value={filters.min_seats} onChange={e => set('min_seats', e.target.value)} placeholder="e.g. 5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (LKR/day)</label>
            <input type="number" min="0" value={filters.min_price} onChange={e => set('min_price', e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (LKR/day)</label>
            <input type="number" min="0" value={filters.max_price} onChange={e => set('max_price', e.target.value)} placeholder="Any" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
