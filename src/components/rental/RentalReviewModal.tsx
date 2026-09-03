import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { RentalService } from '../../services/api/rental.service';

interface RentalReviewModalProps {
  rentalUuid: string;
  vehicleName: string;
  onSuccess: () => void;
}

export default function RentalReviewModal({
  rentalUuid,
  vehicleName,
  onSuccess,
}: RentalReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please choose a rating between 1 and 5 stars.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please provide a short written review of at least 5 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await RentalService.submitReview(rentalUuid, {
        rating,
        comment: comment.trim(),
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit rental review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-blue-50/50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-lg mx-auto mb-6">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Star className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
          <span>Mandatory Rental Review</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Rate Your Rental Experience
        </h3>
        <p className="text-xs text-slate-600">
          Your vehicle return is completed! Please rate and review your self-drive trip with{' '}
          <span className="font-bold text-slate-800">{vehicleName}</span> to finalize your rental record.
        </p>
      </div>

      {error && (
        <div className="max-w-lg mx-auto mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
        {/* Star Rating Selection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Overall Star Rating
          </label>
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                title={`${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-700 mt-2 block">
            {rating === 5 && 'Outstanding Experience!'}
            {rating === 4 && 'Very Good Trip'}
            {rating === 3 && 'Average Experience'}
            {rating === 2 && 'Below Expectations'}
            {rating === 1 && 'Poor Experience'}
          </span>
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            <span>Written Feedback & Experience</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the vehicle condition, drive comfort, owner communication..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
        >
          {submitting ? (
            <span>Submitting Review...</span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Review & Complete Rental</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
