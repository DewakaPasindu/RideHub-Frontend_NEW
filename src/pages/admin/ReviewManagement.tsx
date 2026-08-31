import React from 'react';
import { MessageSquare, CheckCircle, XCircle, Eye, Clock, Trash2, Star } from 'lucide-react';
import { ReviewService, ReviewRow } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../../components/common/StarRating';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReviewManagement() {
  const { user } = useAuth();
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('pending');
  const [rejectId, setRejectId] = React.useState('');
  const [rejectNote, setRejectNote] = React.useState('');
  const [processing, setProcessing] = React.useState('');

  const load = async (status: string) => {
    setLoading(true);
    try {
      const { data, count } = await ReviewService.listAll(status !== 'all' ? status : undefined);
      setReviews(data);
      setTotal(count);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(statusFilter); }, [statusFilter]);

  const approve = async (id: string) => {
    if (!user) return;
    setProcessing(id);
    try {
      await ReviewService.approve(id, user.id);
      load(statusFilter);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  const reject = async () => {
    if (!user || !rejectNote.trim()) return;
    setProcessing(rejectId);
    try {
      await ReviewService.reject(rejectId, rejectNote, user.id);
      setRejectId(''); setRejectNote('');
      load(statusFilter);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await ReviewService.delete(id);
      load(statusFilter);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-medium text-gray-900">{r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Anonymous'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-700">{r.target_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating value={r.rating} readonly size="sm" />
                    <span className="text-xs text-gray-500 capitalize">{r.target_type}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => approve(r.id)} disabled={processing === r.id} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-60">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => setRejectId(r.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteReview(r.id)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {r.comment && <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{r.comment}</p>}
              {r.moderation_note && <p className="text-xs text-red-600 mt-2"><span className="font-medium">Moderation note:</span> {r.moderation_note}</p>}
            </div>
          ))}
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Reject Review</h3>
            <textarea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Moderation note (optional)" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" />
            <div className="flex space-x-3">
              <button onClick={() => { setRejectId(''); setRejectNote(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={reject} disabled={processing === rejectId} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
