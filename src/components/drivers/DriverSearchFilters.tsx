import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface DriverFilterState {
  search: string;
  min_experience: string;
  min_rating: string;
  nearest_town: string;
  specialty: string;
  availability_status: string;
  sort: string;
}

export const defaultDriverFilters: DriverFilterState = {
  search: '', min_experience: '', min_rating: '', nearest_town: '',
  specialty: '', availability_status: '', sort: 'rating_desc'
};

interface Props {
  filters: DriverFilterState;
  onChange: (f: DriverFilterState) => void;
}

const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];
const SPECIALTIES = ['Luxury Vehicles', 'Tour Guide', 'Long Distance', 'Commercial Vehicles', 'City Expert', 'Off-road Specialist', 'Adventure Tours', 'Mountain Driving', 'Night Driving'];

export default function DriverSearchFilters({ filters, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const set = (key: keyof DriverFilterState, value: string) => onChange({ ...filters, [key]: value });
  const hasActive = Object.entries(filters).some(([k, v]) => k !== 'sort' && v !== '');
  const reset = () => onChange(defaultDriverFilters);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search drivers by name, location..."
            value={filters.search} onChange={e => set('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={filters.sort} onChange={e => set('sort', e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="rating_desc">Highest Rated</option>
          <option value="experience_desc">Most Experienced</option>
          <option value="experience_asc">Least Experienced</option>
        </select>
        <button onClick={() => setOpen(!open)} className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${hasActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters{hasActive ? ' (active)' : ''}</span>
        </button>
        {hasActive && (
          <button onClick={reset} className="flex items-center space-x-1 px-3 py-2.5 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <X className="h-4 w-4" /><span>Clear</span>
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Experience (yrs)</label>
            <input type="number" min="0" value={filters.min_experience} onChange={e => set('min_experience', e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Rating</label>
            <select value={filters.min_rating} onChange={e => set('min_rating', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Any Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4+</option>
              <option value="3">3+</option>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Specialty</label>
            <select value={filters.specialty} onChange={e => set('specialty', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Specialties</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
            <select value={filters.availability_status} onChange={e => set('availability_status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Any</option>
              <option value="available">Available Now</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
