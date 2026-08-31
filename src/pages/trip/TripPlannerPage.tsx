import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ChevronRight } from 'lucide-react';
import TripSearchPanel, { TripFormValues } from '../../components/trip/TripSearchPanel';
import TripAnalysisSummary from '../../components/trip/TripAnalysisSummary';
import RouteMapPanel from '../../components/trip/RouteMapPanel';
import VehicleRecommendationPanel from '../../components/trip/VehicleRecommendationPanel';
import DriverMatchPanel from '../../components/trip/DriverMatchPanel';
import BookingPreviewPanel from '../../components/trip/BookingPreviewPanel';
import LocationPermissionBanner from '../../components/location/LocationPermissionBanner';
import { useLocation as useGPS } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { TripSearchService, TripAnalysis } from '../../services/api/TripSearchService';
import { AIService, VehicleRecommendation, DriverMatch } from '../../services/api/AIService';
import { VehicleService, Vehicle } from '../../services/api/VehicleService';
import { DriverService, DriverProfile } from '../../services/api/DriverService';
import { BookingService } from '../../services/api/BookingService';
import { LocationService } from '../../services/api/LocationService';

type Step = 'search' | 'results' | 'preview';

const STEPS = [
  { id: 'search', label: 'Plan Trip', short: 'Trip' },
  { id: 'results', label: 'Choose Vehicle & Driver', short: 'Choose' },
  { id: 'preview', label: 'Confirm Booking', short: 'Confirm' },
] as const;

const defaultForm: TripFormValues = {
  pickup: null,
  destination: null,
  passenger_count: 2,
  budget: 10000,
  luggage_size: 'light',
  trip_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  driver_required: true,
};

export default function TripPlannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { coords: gpsCoords, permission } = useGPS();

  const [step, setStep] = React.useState<Step>('search');
  const [tripForm, setTripForm] = React.useState<TripFormValues>(defaultForm);
  const [analysing, setAnalysing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<TripAnalysis | null>(null);

  const [vehicleRecs, setVehicleRecs] = React.useState<VehicleRecommendation[]>([]);
  const [vehicleLoading, setVehicleLoading] = React.useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);

  const [driverMatches, setDriverMatches] = React.useState<DriverMatch[]>([]);
  const [driverLoading, setDriverLoading] = React.useState(false);
  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null);
  const [driverSkipped, setDriverSkipped] = React.useState(false);

  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState('');

  const selectedVehicle = vehicleRecs.find(r => r.vehicle.id === selectedVehicleId)?.vehicle ?? null;
  const selectedDriver = driverMatches.find(m => m.driver.id === selectedDriverId)?.driver ?? null;

  // Pre-populate from query params (e.g. coming from Home search widget)
  React.useEffect(() => {
    const pickup = searchParams.get('pickup');
    const dest = searchParams.get('destination');
    if (pickup || dest) {
      setTripForm(f => ({
        ...f,
        ...(pickup ? { pickup: { lat: 0, lng: 0, address: pickup } } : {}),
        ...(dest ? { destination: { lat: 0, lng: 0, address: dest } } : {}),
      }));
    }
  }, []);

  // Auto-fill GPS pickup
  React.useEffect(() => {
    if (gpsCoords && !tripForm.pickup) {
      LocationService.reverseGeocode(gpsCoords).then(address => {
        setTripForm(f => ({ ...f, pickup: { ...gpsCoords, address } }));
      }).catch(() => {});
    }
  }, [gpsCoords]);

  const handleSearch = async () => {
    if (!tripForm.pickup || !tripForm.destination) return;
    setAnalysing(true);
    setError('');
    try {
      const tripReq = {
        pickup: tripForm.pickup as TripFormValues['pickup'] & { address: string },
        destination: tripForm.destination as TripFormValues['destination'] & { address: string },
        passenger_count: tripForm.passenger_count,
        budget: tripForm.budget,
        luggage_size: tripForm.luggage_size,
        trip_date: tripForm.trip_date,
        driver_required: tripForm.driver_required,
      };
      const a = await TripSearchService.analyzeTrip(tripReq);
      setAnalysis(a);

      // Fetch real vehicles from API
      setVehicleLoading(true);
      const { data: vehicles } = await VehicleService.list({
        approval_status: 'approved',
        min_seats: tripForm.passenger_count,
        per_page: 30,
      });

      // Score them with AI
      const recs = await AIService.getVehicleRecommendations({
        passenger_count: tripForm.passenger_count,
        budget: tripForm.budget,
        distance_km: a.distance_km,
        luggage_size: tripForm.luggage_size,
        pickup_location: tripForm.pickup ?? undefined,
        destination: tripForm.destination ?? undefined,
        trip_analysis: a,
      }, vehicles);
      setVehicleRecs(recs);
      setVehicleLoading(false);
      setSelectedVehicleId(recs[0]?.vehicle.id ?? null);

      // Fetch drivers if required
      if (tripForm.driver_required) {
        setDriverLoading(true);
        const { data: drivers } = await DriverService.list({
          approval_status: 'approved',
          availability_status: 'available',
          per_page: 30,
        });
        const matches = await AIService.getDriverMatches({
          pickup_location: tripForm.pickup ?? { lat: 0, lng: 0 },
          distance_km: a.distance_km,
        }, drivers);
        setDriverMatches(matches);
        setSelectedDriverId(matches[0]?.driver.id ?? null);
        setDriverLoading(false);
      } else {
        setDriverMatches([]);
        setDriverSkipped(true);
      }

      setStep('results');
    } catch (err) {
      setError('Failed to analyse trip. Please check your locations and try again.');
      console.error(err);
    } finally {
      setAnalysing(false);
      setVehicleLoading(false);
      setDriverLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!selectedVehicle || !tripForm.pickup) return;
    setConfirming(true);
    setError('');
    try {
      await BookingService.create({
        booking_type: 'vehicle',
        vehicle_id: selectedVehicle.id,
        target_name: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        start_date: tripForm.trip_date,
        end_date: tripForm.trip_date,
        start_time: '09:00',
        end_time: '18:00',
        pickup_location: tripForm.pickup.address,
        dropoff_location: tripForm.destination?.address ?? '',
        pickup_lat: tripForm.pickup.lat,
        pickup_lng: tripForm.pickup.lng,
        dropoff_lat: tripForm.destination?.lat,
        dropoff_lng: tripForm.destination?.lng,
        passenger_count: tripForm.passenger_count,
        total_amount: selectedVehicle.price_per_day,
        advance_amount: 0,
        driver_assigned_id: selectedDriverId ?? undefined,
        notes: `Trip Distance: ${analysis?.distance_km} km. AI Matched trip plan.`,
      } as Parameters<typeof BookingService.create>[0]);
      navigate('/bookings', { state: { success: 'Booking submitted! Awaiting approval.' } });
    } catch (err: unknown) {
      setError((err as { userMessage?: string })?.userMessage ?? 'Failed to create booking. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleEditStep = (target: 'trip' | 'vehicle' | 'driver') => {
    if (target === 'trip') setStep('search');
    else setStep('results');
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center space-x-2 ${i <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i < currentStepIndex
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : i === currentStepIndex
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                  <span className="text-sm font-medium sm:hidden">{s.short}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-colors ${i < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {permission === 'denied' && (
          <div className="mb-6">
            <LocationPermissionBanner />
          </div>
        )}

        {/* ====== STEP: SEARCH ====== */}
        {step === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <TripSearchPanel
                value={tripForm}
                onChange={setTripForm}
                onSearch={handleSearch}
                loading={analysing}
              />
            </div>
            <div>
              <RouteMapPanel
                pickup={tripForm.pickup}
                destination={tripForm.destination}
                distanceKm={null}
                durationLabel={null}
                height="520px"
              />
            </div>
          </div>
        )}

        {/* ====== STEP: RESULTS ====== */}
        {step === 'results' && analysis && (
          <div className="space-y-8">
            {/* Map + Analysis summary side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <RouteMapPanel
                  pickup={tripForm.pickup}
                  destination={tripForm.destination}
                  distanceKm={analysis.distance_km}
                  durationLabel={analysis.estimated_hours_label}
                  driverLocations={driverMatches.slice(0, 3).map((m, i) => ({
                    id: m.driver.id,
                    name: m.driver.user ? `${m.driver.user.first_name}` : 'Driver',
                    coords: {
                      lat: (tripForm.pickup?.lat ?? 6.9) + (Math.random() - 0.5) * 0.15,
                      lng: (tripForm.pickup?.lng ?? 79.8) + (Math.random() - 0.5) * 0.15,
                    },
                    distanceKm: m.distance_km,
                  }))}
                  height="360px"
                />
              </div>
              <div className="lg:col-span-2">
                <TripAnalysisSummary analysis={analysis} />
              </div>
            </div>

            {/* Vehicle recommendations */}
            <div>
              <VehicleRecommendationPanel
                recommendations={vehicleRecs}
                selectedId={selectedVehicleId}
                onSelect={setSelectedVehicleId}
                loading={vehicleLoading}
              />
            </div>

            {/* Driver matching (only if driver required) */}
            {tripForm.driver_required && !driverSkipped && (
              <div>
                <DriverMatchPanel
                  matches={driverMatches}
                  selectedId={selectedDriverId}
                  onSelect={setSelectedDriverId}
                  onSkip={() => { setSelectedDriverId(null); setDriverSkipped(true); }}
                  loading={driverLoading}
                />
              </div>
            )}

            {/* Continue to preview */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button onClick={() => setStep('search')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                ← Edit Search
              </button>
              <button
                onClick={() => setStep('preview')}
                disabled={!selectedVehicleId}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP: PREVIEW ====== */}
        {step === 'preview' && analysis && (
          <div className="max-w-2xl mx-auto">
            <BookingPreviewPanel
              tripForm={tripForm}
              analysis={analysis}
              selectedVehicle={selectedVehicle}
              selectedDriver={selectedDriver}
              onEdit={handleEditStep}
              onConfirm={handleConfirm}
              confirming={confirming}
            />
          </div>
        )}
      </div>
    </div>
  );
}
