import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Car, Calendar, AlertTriangle, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';
import { AdminService } from '../../services/api/admin.service';

export default function AdminGlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    try {
      setLoading(true);
      const data = await AdminService.search(term.trim());
      setResults(data);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const hasAnyResults = results && Object.values(results).some((arr: any) => Array.isArray(arr) && arr.length > 0);

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <h1 className="text-2xl font-black text-white tracking-wide">GLOBAL OPERATIONS SEARCH</h1>
        <p className="text-xs text-slate-400">Search across all users, fleet vehicles, drivers, bookings, rentals, and complaints</p>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, vehicle plate, ticket number, or UUID..."
            className="w-full pl-12 pr-28 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-6">
          {!hasAnyResults ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Users */}
              {results.users?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Users ({results.users.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((u: any) => (
                      <Link
                        key={u.id}
                        to={u.link}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{u.title}</p>
                          <p className="text-[11px] text-slate-400">{u.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                          {u.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers */}
              {results.drivers?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Drivers ({results.drivers.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.drivers.map((d: any) => (
                      <Link
                        key={d.id}
                        to={d.link}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{d.title}</p>
                          <p className="text-[11px] text-slate-400">{d.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {d.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {results.vehicles?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-purple-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Vehicles ({results.vehicles.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.vehicles.map((v: any) => (
                      <Link
                        key={v.id}
                        to={v.link}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{v.title}</p>
                          <p className="text-[11px] text-slate-400">{v.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {v.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings & Rentals */}
              {(results.bookings?.length > 0 || results.rentals?.length > 0) && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Trips & Rentals ({(results.bookings?.length || 0) + (results.rentals?.length || 0)})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[...(results.bookings || []), ...(results.rentals || [])].map((item: any) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Complaints */}
              {results.complaints?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Disputes ({results.complaints.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.complaints.map((c: any) => (
                      <Link
                        key={c.id}
                        to={c.link}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{c.title}</p>
                          <p className="text-[11px] text-slate-400">{c.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {c.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}