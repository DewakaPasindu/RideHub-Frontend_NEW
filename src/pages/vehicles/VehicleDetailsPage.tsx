import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, MapPin, Users, Fuel, Settings, Snowflake, Star, Calendar, ChevronLeft, Share2, CreditCard as Edit, User } from 'lucide-react';
import { VehicleService } from '../../services/api/VehicleService';
import type { Vehicle as VehicleRow } from '../../services/api/VehicleService';
import { ReviewService } from '../../services/api/ReviewService';
import type { Review as ReviewRow } from '../../services/api/ReviewService';
import VehicleGallery from '../../components/vehicles/VehicleGallery';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../contexts/AuthContext';

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [vehicle, setVehicle] = React.useState<VehicleRow | null>(null);
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reviewStats, setReviewStats] = React.useState({ avg: 0, count: 0, distribution: {} as Record<number, number> });

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [v, r, s] = await Promise.all([
          VehicleService.getById(id),
          ReviewService.listForVehicle(id),
          ReviewService.getStats('vehicle', id)
        ]);
        if (!v) { setError('Vehicle not found'); return; }
        setVehicle(v);
        setReviews(r);
        setReviewStats(s);
      } catch {
        setError('Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !vehicle) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">{error || 'Vehicle not found'}</h2>
      <button onClick={() => navigate('/vehicles')} className="mt-4 text-blue-600 hover:underline">Back to listings</button>
    </div>
  );

  const isOwner = user?.id === vehicle.owner_id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/vehicles')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Vehicles</span>
        </button>
        <div className="flex space-x-2">
          {isOwner && (
            <button onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <VehicleGallery images={vehicle.images || []} alt={`${vehicle.brand} ${vehicle.model}`} />

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-gray-500">{vehicle.year} • {vehicle.vehicle_number}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">LKR {vehicle.price_per_day.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">per day</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
              {[
                { icon: Car, label: 'Type', value: vehicle.vehicle_type },
                { icon: Users, label: 'Seats', value: `${vehicle.seat_count} passengers` },
                { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type },
                { icon: Settings, label: 'Transmission', value: vehicle.transmission },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {vehicle.has_ac && (
                <span className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <Snowflake className="h-3.5 w-3.5" />
                  <span>Air Conditioning</span>
                </span>
              )}
              {(vehicle.features || []).map(f => (
                <span key={f} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{f}</span>
              ))}
            </div>

            {vehicle.description && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">About this vehicle</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              {reviewStats.count > 0 && (
                <div className="flex items-center space-x-2">
                  <StarRating value={Math.round(reviewStats.avg)} readonly size="sm" />
                  <span className="text-sm font-medium text-gray-700">{reviewStats.avg} ({reviewStats.count})</span>
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
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${vehicle.availability_status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">{vehicle.availability_status}</span>
            </div>

            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-blue-600">LKR {vehicle.price_per_day.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">per day</p>
            </div>

            {vehicle.nearest_town && (
              <div className="flex items-center space-x-2 text-gray-600 text-sm mb-4">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{vehicle.nearest_town}</span>
              </div>
            )}

            {reviewStats.count > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <StarRating value={Math.round(reviewStats.avg)} readonly size="sm" />
                <span className="text-sm text-gray-600">{reviewStats.avg}/5 ({reviewStats.count} reviews)</span>
              </div>
            )}

            {vehicle.approval_status === 'approved' && vehicle.availability_status === 'available' ? (
              isLoggedIn ? (
                <div className="space-y-2">
                  <button onClick={() => navigate(`/vehicles/book/${vehicle.id}`)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Book with Driver</span>
                  </button>
                  <button onClick={() => navigate(`/customer/rentals/apply?vehicle_id=${vehicle.id}`)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Self-Drive Rental</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Login to Rent / Book
                </button>
              )
            ) : (
              <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center text-sm">
                {vehicle.approval_status !== 'approved' ? 'Pending Approval' : 'Currently Unavailable'}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {vehicle.owner && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Owner: {vehicle.owner.first_name} {vehicle.owner.last_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
