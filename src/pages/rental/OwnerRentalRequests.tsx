import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Car, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';

export default function OwnerRentalRequests() {
  const [requests, setRequests] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const data = await RentalService.getOwnerRequests();
      setRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load rental requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading owner requests dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Self-Drive Rental Requests</h2>
          <p className="text-xs text-slate-500 mt-1">Review applicant profiles, driving credentials, and coordinate release condition checks.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <Car className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="text-sm font-semibold">No rental requests logged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'submitted' ? 'bg-amber-100 text-amber-700 font-bold' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-md font-bold text-slate-800 mb-1">
                  {req.vehicle?.make} {req.vehicle?.model}
                </h3>
                
                <div className="space-y-2 mt-4 mb-6 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Customer: <strong>{req.first_name} {req.last_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      {new Date(req.start_at).toLocaleDateString()} &rarr; {new Date(req.end_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/owner/rental-requests/${req.uuid}`}
                className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                View & Review Application
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
