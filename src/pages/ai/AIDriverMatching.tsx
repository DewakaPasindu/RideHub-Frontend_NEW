import React from 'react';
import { Users, MapPin, Star, Award, Target, TrendingUp, BarChart2, Info } from 'lucide-react';
import { DriverService, DriverProfileRow } from '../../services/driverService';

interface MatchScore {
  driver: DriverProfileRow;
  distanceScore: number;
  experienceScore: number;
  ratingScore: number;
  availabilityScore: number;
  finalScore: number;
  name: string;
}

function calcScores(drivers: DriverProfileRow[], requestTown: string): MatchScore[] {
  return drivers.map(d => {
    const distanceScore = requestTown && d.nearest_town
      ? d.nearest_town.toLowerCase() === requestTown.toLowerCase() ? 100 : 60
      : 50;
    const experienceScore = Math.min(100, (d.experience_years / 20) * 100);
    const ratingScore = (d.rating / 5) * 100;
    const availabilityScore = d.availability_status === 'available' ? 100 : 20;
    const finalScore = Math.round(distanceScore * 0.2 + experienceScore * 0.25 + ratingScore * 0.35 + availabilityScore * 0.2);
    const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Unknown Driver';
    return { driver: d, distanceScore: Math.round(distanceScore), experienceScore: Math.round(experienceScore), ratingScore: Math.round(ratingScore), availabilityScore, finalScore, name };
  }).sort((a, b) => b.finalScore - a.finalScore);
}

const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%`, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

export default function AIDriverMatching() {
  const [drivers, setDrivers] = React.useState<DriverProfileRow[]>([]);
  const [matched, setMatched] = React.useState<MatchScore[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [requestTown, setRequestTown] = React.useState('Colombo');
  const [minExp, setMinExp] = React.useState('0');
  const [minRating, setMinRating] = React.useState('0');
  const [compare, setCompare] = React.useState<string[]>([]);
  const [ran, setRan] = React.useState(false);

  const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee'];

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await DriverService.list({
        approval_status: 'approved',
        min_experience: parseInt(minExp) || 0,
        min_rating: parseFloat(minRating) || 0,
        per_page: 50,
      });
      const scores = calcScores(data, requestTown);
      setMatched(scores);
      setDrivers(data);
      setRan(true);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const toggleCompare = (id: string) => {
    setCompare(c => c.includes(id) ? c.filter(x => x !== id) : c.length < 3 ? [...c, id] : c);
  };

  const compareSet = matched.filter(m => compare.includes(m.driver.id));
  const placeholder = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl"><Target className="h-7 w-7 text-blue-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Driver Matching</h1>
          <p className="text-gray-500 text-sm">Smart driver ranking based on multiple factors</p>
        </div>
      </div>

      {/* Query Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Location</label>
            <select value={requestTown} onChange={e => setRequestTown(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (yrs)</label>
            <input type="number" min="0" max="40" value={minExp} onChange={e => setMinExp(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select value={minRating} onChange={e => setMinRating(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="0">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={run} disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center space-x-2">
              <Target className="h-4 w-4" />
              <span>{loading ? 'Matching...' : 'Run Matching'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Weights Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-medium">Scoring Formula:</span> Distance (20%) + Experience (25%) + Rating (35%) + Availability (20%)
        </div>
      </div>

      {ran && (
        <>
          {/* Compare selector */}
          {compare.length >= 2 && (
            <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-4">Driver Comparison ({compare.length} selected)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 pr-4 text-gray-500 font-medium">Metric</th>
                      {compareSet.map(m => (
                        <th key={m.driver.id} className="text-center py-2 px-3 font-medium text-gray-800">{m.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Match Score', key: 'finalScore' as keyof MatchScore },
                      { label: 'Distance Score', key: 'distanceScore' as keyof MatchScore },
                      { label: 'Experience Score', key: 'experienceScore' as keyof MatchScore },
                      { label: 'Rating Score', key: 'ratingScore' as keyof MatchScore },
                      { label: 'Availability Score', key: 'availabilityScore' as keyof MatchScore },
                    ].map(row => {
                      const max = Math.max(...compareSet.map(m => m[row.key] as number));
                      return (
                        <tr key={row.label}>
                          <td className="py-2 pr-4 text-gray-600">{row.label}</td>
                          {compareSet.map(m => (
                            <td key={m.driver.id} className={`py-2 px-3 text-center font-medium ${m[row.key] === max ? 'text-green-600' : 'text-gray-700'}`}>
                              {m[row.key] as number}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {matched.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <p className="text-gray-500">No drivers match the criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{matched.length} drivers ranked</p>
                <p className="text-xs text-gray-400">Select up to 3 drivers to compare</p>
              </div>
              {matched.map((m, rank) => (
                <div key={m.driver.id} className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${compare.includes(m.driver.id) ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'}`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-center w-10">
                      <div className={`text-2xl font-black ${rank === 0 ? 'text-amber-500' : rank === 1 ? 'text-gray-500' : rank === 2 ? 'text-amber-700' : 'text-gray-400'}`}>#{rank + 1}</div>
                    </div>
                    <img src={m.driver.profile_photo || placeholder} alt={m.name} className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{m.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1"><Award className="h-3.5 w-3.5" /><span>{m.driver.experience_years}y exp</span></span>
                            <span className="flex items-center space-x-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /><span>{m.driver.rating.toFixed(1)}</span></span>
                            {m.driver.nearest_town && <span className="flex items-center space-x-1"><MapPin className="h-3.5 w-3.5" /><span>{m.driver.nearest_town}</span></span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-3xl font-black text-blue-600">{m.finalScore}</div>
                            <div className="text-xs text-gray-400">match score</div>
                          </div>
                          <button
                            onClick={() => toggleCompare(m.driver.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${compare.includes(m.driver.id) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                          >
                            {compare.includes(m.driver.id) ? 'Remove' : 'Compare'}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ScoreBar label="Distance" value={m.distanceScore} color="bg-blue-400" />
                        <ScoreBar label="Experience" value={m.experienceScore} color="bg-green-400" />
                        <ScoreBar label="Rating" value={m.ratingScore} color="bg-amber-400" />
                        <ScoreBar label="Availability" value={m.availabilityScore} color="bg-purple-400" />
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
          <p className="text-gray-500">Set your parameters and run the matching algorithm</p>
        </div>
      )}
    </div>
  );
}
