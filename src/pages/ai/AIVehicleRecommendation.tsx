import React from 'react';
import { Car, Users, DollarSign, Route, Zap, Star, Snowflake, Settings, Fuel, TrendingUp } from 'lucide-react';
import { VehicleService, VehicleRow } from '../../services/vehicleService';

interface Recommendation {
  vehicle: VehicleRow;
  score: number;
  confidence: number;
  reasons: string[];
}

function recommend(vehicles: VehicleRow[], passengers: number, budget: number, distance: number, luggage: string): Recommendation[] {
  return vehicles.map(v => {
    let score = 0;
    const reasons: string[] = [];

    // Seat fit
    if (v.seat_count >= passengers) {
      score += 30;
      if (v.seat_count <= passengers + 2) { score += 10; reasons.push(`Perfect seat count (${v.seat_count} seats)`); }
      else reasons.push(`Enough seats (${v.seat_count} seats)`);
    }

    // Budget
    const budgetPerDay = budget;
    if (v.price_per_day <= budgetPerDay) {
      score += 25;
      if (v.price_per_day <= budgetPerDay * 0.8) { score += 5; reasons.push('Well within budget'); }
      else reasons.push('Within budget');
    }

    // Luggage - vehicle type
    if (luggage === 'heavy') {
      if (['van', 'truck', 'bus'].includes(v.vehicle_type)) { score += 15; reasons.push('Large cargo capacity'); }
    } else if (luggage === 'medium') {
      if (['suv', 'van', 'minibus'].includes(v.vehicle_type)) { score += 15; reasons.push('Good cargo space'); }
      else if (v.vehicle_type === 'car') { score += 8; }
    } else {
      score += 10;
    }

    // Distance - fuel
    if (distance > 200) {
      if (v.fuel_type === 'diesel' || v.fuel_type === 'hybrid') { score += 10; reasons.push('Fuel efficient for long trips'); }
    }

    // AC
    if (v.has_ac) { score += 5; reasons.push('Air conditioned'); }

    const confidence = Math.min(99, Math.round((score / 95) * 100));
    return { vehicle: v, score, confidence, reasons };
  })
    .filter(r => r.vehicle.seat_count >= passengers && r.vehicle.price_per_day <= budget)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

const placeholder = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80';

export default function AIVehicleRecommendation() {
  const [form, setForm] = React.useState({ passengers: '2', budget: '10000', distance: '50', luggage: 'light' });
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [ran, setRan] = React.useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await VehicleService.list({ approval_status: 'approved', per_page: 100 });
      const recs = recommend(data, parseInt(form.passengers), parseFloat(form.budget), parseFloat(form.distance), form.luggage);
      setRecommendations(recs);
      setRan(true);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const confidenceColor = (c: number) => c >= 80 ? 'text-green-600 bg-green-50' : c >= 60 ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-green-100 rounded-xl"><Zap className="h-7 w-7 text-green-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Vehicle Recommendation</h1>
          <p className="text-gray-500 text-sm">Smart vehicle matching based on your trip requirements</p>
        </div>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Requirements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1"><Users className="h-4 w-4 text-gray-400" /><span>Passengers</span></label>
            <input type="number" min="1" max="50" value={form.passengers} onChange={e => set('passengers', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1"><DollarSign className="h-4 w-4 text-gray-400" /><span>Budget/Day (LKR)</span></label>
            <input type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1"><Route className="h-4 w-4 text-gray-400" /><span>Distance (km)</span></label>
            <input type="number" min="1" value={form.distance} onChange={e => set('distance', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Luggage Size</label>
            <select value={form.luggage} onChange={e => set('luggage', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="light">Light (carry-on)</option>
              <option value="medium">Medium (1-2 bags)</option>
              <option value="heavy">Heavy (3+ bags)</option>
            </select>
          </div>
        </div>
        <button onClick={run} disabled={loading} className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>{loading ? 'Analyzing...' : 'Get Recommendations'}</span>
        </button>
      </div>

      {ran && (
        <>
          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <Car className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No vehicles match your requirements</p>
              <p className="text-gray-400 text-sm mt-1">Try increasing your budget or reducing passenger count</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">{recommendations.length} vehicle{recommendations.length !== 1 ? 's' : ''} recommended</p>
              {recommendations.map((rec, i) => (
                <div key={rec.vehicle.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${i === 0 ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-48 h-36 md:h-auto flex-shrink-0">
                      <img src={rec.vehicle.images?.[0] || placeholder} alt={`${rec.vehicle.brand} ${rec.vehicle.model}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Best Match</div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full">#{i + 1}</div>
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{rec.vehicle.brand} {rec.vehicle.model}</h3>
                          <p className="text-gray-500 text-sm">{rec.vehicle.year} • {rec.vehicle.vehicle_number}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${confidenceColor(rec.confidence)}`}>{rec.confidence}% match</div>
                          <div className="text-xl font-bold text-blue-600 mt-1">LKR {rec.vehicle.price_per_day.toLocaleString()}<span className="text-sm font-normal text-gray-500">/day</span></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"><Users className="h-3.5 w-3.5" /><span>{rec.vehicle.seat_count} seats</span></span>
                        <span className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full capitalize"><Settings className="h-3.5 w-3.5" /><span>{rec.vehicle.transmission}</span></span>
                        <span className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full capitalize"><Fuel className="h-3.5 w-3.5" /><span>{rec.vehicle.fuel_type}</span></span>
                        {rec.vehicle.has_ac && <span className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"><Snowflake className="h-3.5 w-3.5" /><span>AC</span></span>}
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-800 mb-1">Why this vehicle?</p>
                        <ul className="space-y-0.5">
                          {rec.reasons.map((r, j) => (
                            <li key={j} className="text-xs text-green-700 flex items-center space-x-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Confidence bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1 text-gray-500">
                          <span>Recommendation confidence</span>
                          <span className="font-medium">{rec.confidence}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${rec.confidence}%`, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!ran && (
        <div className="text-center py-20">
          <TrendingUp className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">Fill in your trip requirements and get AI-powered recommendations</p>
        </div>
      )}
    </div>
  );
}
