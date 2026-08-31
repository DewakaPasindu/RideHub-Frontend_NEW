import React from 'react';
import { Car, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { VehicleService, VehicleRow } from '../../services/vehicleService';
import VehicleGallery from '../../components/vehicles/VehicleGallery';
import { useAuth } from '../../contexts/AuthContext';

export default function VehicleApprovals() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = React.useState<VehicleRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<VehicleRow | null>(null);
  const [rejectId, setRejectId] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [processing, setProcessing] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await VehicleService.list({ approval_status: 'pending', per_page: 50 });
      setVehicles(data);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    if (!user) return;
    setProcessing(id);
    try {
      await VehicleService.approve(id, user.id);
      setVehicles(vs => vs.filter(v => v.id !== id));
      setSelected(null);
    } catch { /* ignore */ } finally {
      setProcessing('');
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(rejectId);
    try {
      await VehicleService.reject(rejectId, rejectReason);
      setVehicles(vs => vs.filter(v => v.id !== rejectId));
      setRejectId('');
      setRejectReason('');
      setSelected(null);
    } catch { /* ignore */ } finally {
      setProcessing('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} pending vehicle{vehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <Clock className="h-4 w-4" /><span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500">No pending vehicle approvals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'; }} />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{v.brand} {v.model} ({v.year})</h3>
                <p className="text-sm text-gray-500 mb-1">{v.vehicle_number} • {v.vehicle_type} • {v.seat_count} seats</p>
                <p className="text-sm text-blue-600 font-medium mb-3">LKR {v.price_per_day.toLocaleString()}/day</p>
                {v.owner && <p className="text-xs text-gray-500 mb-3">Owner: {v.owner.first_name} {v.owner.last_name} ({v.owner.email})</p>}
                <div className="flex space-x-2">
                  <button onClick={() => setSelected(v)} className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4" /><span>View</span>
                  </button>
                  <button onClick={() => approve(v.id)} disabled={processing === v.id} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60">
                    <CheckCircle className="h-4 w-4" /><span>Approve</span>
                  </button>
                  <button onClick={() => setRejectId(v.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    <XCircle className="h-4 w-4" /><span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Vehicle Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <VehicleGallery images={selected.images || []} alt={`${selected.brand} ${selected.model}`} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[['Number', selected.vehicle_number], ['Brand', selected.brand], ['Model', selected.model], ['Year', selected.year], ['Type', selected.vehicle_type], ['Seats', selected.seat_count], ['Fuel', selected.fuel_type], ['Transmission', selected.transmission], ['Price/Day', `LKR ${selected.price_per_day.toLocaleString()}`], ['AC', selected.has_ac ? 'Yes' : 'No'], ['Town', selected.nearest_town || '-']].map(([l, v]) => (
                  <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="font-medium">{v}</p></div>
                ))}
              </div>
              {selected.description && <p className="mt-3 text-sm text-gray-600">{selected.description}</p>}
              <div className="flex space-x-3 mt-6">
                <button onClick={() => approve(selected.id)} disabled={processing === selected.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5" /><span>Approve</span>
                </button>
                <button onClick={() => { setRejectId(selected.id); setSelected(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                  <XCircle className="h-5 w-5" /><span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Rejection Reason</h3>
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this vehicle is being rejected..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" />
            <div className="flex space-x-3">
              <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={reject} disabled={!rejectReason.trim() || processing === rejectId} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
