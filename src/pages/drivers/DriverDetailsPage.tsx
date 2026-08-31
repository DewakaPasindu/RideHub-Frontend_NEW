import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Star, Award, Phone, Calendar, ChevronLeft, CreditCard as Edit } from 'lucide-react';
import { DriverService } from '../../services/api/DriverService';
import type { DriverProfile as DriverProfileRow } from '../../services/api/DriverService';
import { ReviewService } from '../../services/api/ReviewService';
import type { Review as ReviewRow } from '../../services/api/ReviewService';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../contexts/AuthContext';

export default function DriverDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [driver, setDriver] = React.useState<DriverProfileRow | null>(null);
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [stats, setStats] = React.useState({ avg: 0, count: 0, distribution: {} as Record<number, number> });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [d, r, s] = await Promise.all([
          DriverService.getById(id),
          ReviewService.listForDriver(id),
          ReviewService.getStats('driver', id)
        ]);
        if (!d) { setError('Driver not found'); return; }
        setDriver(d);
        setReviews(r);
        setStats(s);
      } catch {
        setError('Failed to load driver');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  if (error || !driver) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">{error || 'Driver not found'}</h2>
      <button onClick={() => navigate('/drivers')} className="mt-4 text-blue-600 hover:underline">Back to drivers</button>
    </div>
  );

  const name = driver.user ? `${driver.user.first_name} ${driver.user.last_name}` : 'Unknown Driver';
  const isOwner = user?.id === driver.user_id;
  const placeholder = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/drivers')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-5 w-5" /><span>Back to Drivers</span>
        </button>
        {isOwner && (
          <button onClick={() => navigate(`/drivers/edit/${driver.id}`)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Edit className="h-4 w-4" /><span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start space-x-5 mb-5">
              <img src={driver.profile_photo || placeholder} alt={name} className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <div className="flex items-center space-x-1.5 text-amber-500 mt-1">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-lg font-semibold text-gray-800">{driver.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({driver.review_count} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${driver.availability_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {driver.availability_status === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                  {driver.verification_status === 'verified' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className="h-5 w-5 text-gray-400" />
                <div><p className="text-xs text-gray-500">Experience</p><p className="font-semibold">{driver.experience_years} years</p></div>
              </div>
              {driver.nearest_town && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Based In</p><p className="font-semibold">{driver.nearest_town}</p></div>
                </div>
              )}
              {driver.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold">{driver.phone}</p></div>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-5 w-5 text-gray-400" />
                <div><p className="text-xs text-gray-500">Rating</p><p className="font-semibold">{driver.rating.toFixed(1)} / 5.0</p></div>
              </div>
            </div>

            {driver.specialties?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {driver.specialties.map(s => <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
                </div>
              </div>
            )}

            {driver.address && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                <p className="text-gray-600 text-sm">{driver.address}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              {stats.count > 0 && (
                <div className="flex items-center space-x-2">
                  <StarRating value={Math.round(stats.avg)} readonly size="sm" />
                  <span className="text-sm font-medium text-gray-700">{stats.avg} ({stats.count})</span>
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-sm text-gray-800">{r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Anonymous'}</span>
                      </div>
                      <StarRating value={r.rating} readonly size="sm" />
                    </div>
                    {r.comment && <p className="text-gray-600 text-sm ml-10">{r.comment}</p>}
                    <p className="text-xs text-gray-400 ml-10 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Booking Card */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${driver.availability_status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">{driver.availability_status}</span>
            </div>
            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{driver.experience_years} years</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="font-medium">{driver.rating.toFixed(1)} / 5.0</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reviews</span><span className="font-medium">{driver.review_count}</span></div>
            </div>
            {driver.approval_status === 'approved' && driver.availability_status === 'available' ? (
              isLoggedIn ? (
                <button onClick={() => navigate(`/drivers/book/${driver.id}`)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" /><span>Book This Driver</span>
                </button>
              ) : (
                <button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Login to Book</button>
              )
            ) : (
              <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center text-sm">
                {driver.approval_status !== 'approved' ? 'Pending Approval' : 'Currently Unavailable'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
