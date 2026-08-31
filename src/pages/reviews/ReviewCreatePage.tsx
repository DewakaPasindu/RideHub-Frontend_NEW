import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Send, ChevronLeft } from 'lucide-react';
import { ReviewService } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../../components/common/StarRating';

export default function ReviewCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();

  const bookingId = params.get('booking') || undefined;
  const targetType = (params.get('type') || 'vehicle') as 'vehicle' | 'driver';
  const targetId = params.get('target') || '';
  const targetName = params.get('name') || '';

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetId) return;
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');
    try {
      await ReviewService.create({
        user_id: user.id,
        booking_id: bookingId,
        target_type: targetType,
        ...(targetType === 'vehicle' ? { vehicle_id: targetId } : { driver_profile_id: targetId }),
        target_name: targetName,
        rating,
        comment,
      });
      navigate('/bookings', { state: { success: 'Review submitted! It will appear after moderation.' } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors">
        <ChevronLeft className="h-5 w-5" /><span>Back</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-amber-100 rounded-2xl mb-3">
            <Star className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
          <p className="text-gray-500 mt-1">{targetName}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Your Rating *</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent' : 'Tap to rate'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <textarea
              rows={5} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center space-x-2">
            <Send className="h-5 w-5" />
            <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
