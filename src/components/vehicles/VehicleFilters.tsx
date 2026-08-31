import React from 'react';
import { Search, Filter, MapPin, Snowflake } from 'lucide-react';

interface VehicleFiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function VehicleFilters({ onFilterChange }: VehicleFiltersProps) {
  const [filters, setFilters] = React.useState({
    type: '',
    priceRange: '',
    searchTerm: '',
    nearestTown: '',
    acPreference: ''
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
              placeholder="Search vehicles..."
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onChange={handleChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <select
            name="type"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="car">Car</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <select
            name="priceRange"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Prices</option>
            <option value="0-100">$0 - $100/day</option>
            <option value="101-200">$101 - $200/day</option>
            <option value="201-300">$201 - $300/day</option>
            <option value="301+">$301+/day</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Snowflake className="h-4 w-4 inline mr-1" />
            A/C Preference
          </label>
          <select
            name="acPreference"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={handleChange}
          >
            <option value="">All Vehicles</option>
            <option value="ac">A/C Only</option>
            <option value="non-ac">Non A/C Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}