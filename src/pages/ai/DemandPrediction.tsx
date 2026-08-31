import React from 'react';
import { TrendingUp, BarChart2, Clock, Car, Users, Calendar, ArrowUp, ArrowDown, Minus, Star } from 'lucide-react';

interface ForecastPoint {
  label: string;
  bookings: number;
  vehicles: number;
  drivers: number;
}

interface PopularVehicle {
  name: string;
  type: string;
  bookings: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

const FORECAST: ForecastPoint[] = [
  { label: 'Mon', bookings: 12, vehicles: 8, drivers: 4 },
  { label: 'Tue', bookings: 9, vehicles: 6, drivers: 3 },
  { label: 'Wed', bookings: 15, vehicles: 10, drivers: 5 },
  { label: 'Thu', bookings: 18, vehicles: 12, drivers: 6 },
  { label: 'Fri', bookings: 24, vehicles: 16, drivers: 8 },
  { label: 'Sat', bookings: 31, vehicles: 20, drivers: 11 },
  { label: 'Sun', bookings: 28, vehicles: 18, drivers: 10 },
];

const POPULAR_VEHICLES: PopularVehicle[] = [
  { name: 'Toyota HiAce', type: 'Van', bookings: 142, revenue: 852000, trend: 'up' },
  { name: 'Toyota Prius', type: 'Car', bookings: 118, revenue: 590000, trend: 'up' },
  { name: 'Mitsubishi Delica', type: 'Van', bookings: 95, revenue: 760000, trend: 'stable' },
  { name: 'Honda Vezel', type: 'SUV', bookings: 87, revenue: 696000, trend: 'down' },
  { name: 'Toyota Land Cruiser', type: 'SUV', bookings: 64, revenue: 896000, trend: 'up' },
];

const PEAK_HOURS = [
  { hour: '06-08', demand: 20 }, { hour: '08-10', demand: 65 }, { hour: '10-12', demand: 80 },
  { hour: '12-14', demand: 55 }, { hour: '14-16', demand: 70 }, { hour: '16-18', demand: 90 },
  { hour: '18-20', demand: 75 }, { hour: '20-22', demand: 40 }, { hour: '22-00', demand: 15 },
];

const DEMAND_BY_TOWN = [
  { town: 'Colombo', demand: 95, growth: 12 }, { town: 'Kandy', demand: 72, growth: 8 },
  { town: 'Galle', demand: 61, growth: 15 }, { town: 'Negombo', demand: 58, growth: 5 },
  { town: 'Jaffna', demand: 42, growth: 22 }, { town: 'Matara', demand: 38, growth: 3 },
];

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

const maxBookings = Math.max(...FORECAST.map(f => f.bookings));

export default function DemandPrediction() {
  const [period, setPeriod] = React.useState('week');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 rounded-xl"><TrendingUp className="h-7 w-7 text-indigo-600" /></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demand Prediction</h1>
            <p className="text-gray-500 text-sm">Analytics & forecasting dashboard</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-gray-100 p-0.5 rounded-xl">
          {['week', 'month', 'quarter'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Predicted Bookings', value: '137', change: '+18%', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', up: true },
          { label: 'Vehicle Demand', value: '89', change: '+12%', icon: Car, color: 'text-green-600', bg: 'bg-green-50', up: true },
          { label: 'Driver Demand', value: '48', change: '+9%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', up: true },
          { label: 'Peak Hours', value: '16-18', change: '±1h shift', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', up: null },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{s.label}</p>
              <div className={`${s.bg} p-2 rounded-lg`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className={`text-xs font-medium mt-1 ${s.up === true ? 'text-green-600' : s.up === false ? 'text-red-600' : 'text-gray-500'}`}>{s.change} vs last {period}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Demand Forecast Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">7-Day Demand Forecast</h2>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-end space-x-2 h-40">
            {FORECAST.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                <span className="text-xs text-gray-500">{point.bookings}</span>
                <div className="w-full flex flex-col space-y-0.5">
                  <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${(point.bookings / maxBookings) * 120}px`, transition: 'height 0.5s ease' }} />
                  <div className="w-full bg-green-400 rounded-sm" style={{ height: `${(point.vehicles / maxBookings) * 120}px`, transition: 'height 0.5s ease' }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{point.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1.5"><div className="h-3 w-3 bg-blue-500 rounded-sm" /><span>Bookings</span></div>
            <div className="flex items-center space-x-1.5"><div className="h-3 w-3 bg-green-400 rounded-sm" /><span>Vehicles Needed</span></div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Peak Booking Hours</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {PEAK_HOURS.map(h => (
              <div key={h.hour}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600 font-medium">{h.hour}h</span>
                  <span className={`font-medium ${h.demand >= 80 ? 'text-red-600' : h.demand >= 60 ? 'text-amber-600' : 'text-green-600'}`}>{h.demand}% demand</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${h.demand >= 80 ? 'bg-red-500' : h.demand >= 60 ? 'bg-amber-500' : h.demand >= 40 ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${h.demand}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Vehicles */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Vehicles</h2>
          <div className="space-y-3">
            {POPULAR_VEHICLES.map((v, i) => (
              <div key={v.name} className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-gray-800 truncate">{v.name}</span>
                    <div className="flex items-center space-x-1 ml-2"><TrendIcon trend={v.trend} /><span className="text-sm font-bold text-gray-900">{v.bookings}</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{v.type}</span>
                    <span className="text-xs text-green-600 font-medium">LKR {v.revenue.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(v.bookings / 142) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand by Town */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demand by Location</h2>
          <div className="space-y-4">
            {DEMAND_BY_TOWN.map(t => (
              <div key={t.town}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800">{t.town}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 font-medium flex items-center"><ArrowUp className="h-3 w-3" />{t.growth}%</span>
                    <span className="text-sm font-bold text-gray-900">{t.demand}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500`} style={{ width: `${t.demand}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
