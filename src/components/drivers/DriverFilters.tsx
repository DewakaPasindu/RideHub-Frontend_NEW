import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { FilterState, FilterChangeHandler } from '../../utils/types';

interface DriverFiltersProps {
  onFilterChange: FilterChangeHandler;
}

export default function DriverFilters({ onFilterChange }: DriverFiltersProps) {
  const [filters, setFilters] = React.useState<FilterState & { nearestTown: string }>({
    experience: '',
    rating: '',
    specialty: '',
    searchTerm: '',
    nearestTown: ''
  });

  const towns = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 
    'Polonnaruwa', 'Batticaloa', 'Trincomalee', 'Matara', 'Ratnapura', 
    'Badulla', 'Kurunegala', 'Puttalam', 'Kalutara'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              name="searchTerm"
              placeholder="Search drivers..."
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onChange={handleChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <select
            name="experience"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select
            name="rating"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialty
          </label>
          <select
            name="specialty"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Specialties</option>
            <option value="luxury">Luxury Vehicles</option>
            <option value="commercial">Commercial Vehicles</option>
            <option value="off-road">Off-road Specialist</option>
            <option value="tour">Tour Guide</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" />
            Nearest Town
          </label>
          <select
            name="nearestTown"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Towns</option>
            {towns.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}