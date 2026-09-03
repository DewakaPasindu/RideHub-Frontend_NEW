import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Vehicles
import VehicleListingPage from './pages/vehicles/VehicleListingPage';
import VehicleCreatePage from './pages/vehicles/VehicleCreatePage';
import VehicleEditPage from './pages/vehicles/VehicleEditPage';
import VehicleDetailsPage from './pages/vehicles/VehicleDetailsPage';
import VehicleRegistrationPage from './pages/vehicles/VehicleRegistrationPage';

// Drivers
import DriverListingPage from './pages/drivers/DriverListingPage';
import DriverRegistrationPage from './pages/drivers/DriverRegistrationPage';
import DriverDetailsPage from './pages/drivers/DriverDetailsPage';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import AdminForgotPassword from './pages/auth/AdminForgotPassword';

// Pages
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import About from './pages/About';
import DriverAvailability from './pages/DriverAvailability';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';

// Trip Planner (secondary / tools feature)
import TripPlannerPage from './pages/trip/TripPlannerPage';

// Booking
import BookingCreatePage from './pages/booking/BookingCreatePage';
import UserBookingDashboard from './pages/booking/UserBookingDashboard';
import BookingManagement from './pages/booking/BookingManagement';

// Self-Drive Rentals
import CustomerRentalsList from './pages/rental/CustomerRentalsList';
import CustomerRentalApply from './pages/rental/CustomerRentalApply';
import CustomerRentalDetails from './pages/rental/CustomerRentalDetails';
import CustomerActiveRental from './pages/rental/CustomerActiveRental';
import OwnerRentalRequests from './pages/rental/OwnerRentalRequests';
import OwnerRentalReview from './pages/rental/OwnerRentalReview';
import OwnerRentalReturn from './pages/rental/OwnerRentalReturn';

// Reviews
import ReviewCreatePage from './pages/reviews/ReviewCreatePage';

// AI / Analytics
import AIDriverMatching from './pages/ai/AIDriverMatching';
import AIVehicleRecommendation from './pages/ai/AIVehicleRecommendation';
import AIChatbot from './pages/ai/AIChatbot';
import SafetyMonitoring from './pages/ai/SafetyMonitoring';
import DemandPrediction from './pages/ai/DemandPrediction';

// Admin Operations Center Pages
import AdminLayout from './pages/admin/Layout';
import AdminCommandCenter from './pages/admin/AdminCommandCenter';
import AdminGlobalSearch from './pages/admin/AdminGlobalSearch';
import DriverApprovalCenter from './pages/admin/approvals/DriverApprovalCenter';
import VehicleApprovalCenter from './pages/admin/approvals/VehicleApprovalCenter';
import OwnerApprovalCenter from './pages/admin/approvals/OwnerApprovalCenter';
import LiveOperationsCenter from './pages/admin/live/LiveOperationsCenter';
import FleetManagementCenter from './pages/admin/fleet/FleetManagementCenter';
import DriverManagementCenter from './pages/admin/drivers/DriverManagementCenter';
import UserManagementCenter from './pages/admin/users/UserManagementCenter';
import FinancialCommandCenter from './pages/admin/finance/FinancialCommandCenter';
import SafetyTrustCenter from './pages/admin/safety/SafetyTrustCenter';
import AnalyticsCenter from './pages/admin/analytics/AnalyticsCenter';
import ReportsCenter from './pages/admin/reports/ReportsCenter';
import AuditLogCenter from './pages/admin/audit/AuditLogCenter';
import SystemHealthCenter from './pages/admin/system/SystemHealthCenter';
import PlatformSettingsCenter from './pages/admin/settings/PlatformSettingsCenter';
import RentalOperationsCenter from './pages/admin/rentals/RentalOperationsCenter';

// Existing Admin items
import BookingApprovals from './pages/admin/BookingApprovals';
import RejectedItems from './pages/admin/RejectedItems';
import ReviewManagement from './pages/admin/ReviewManagement';
import AdminProfile from './pages/admin/AdminProfile';
import AdminManagement from './pages/admin/AdminManagement';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

          {/* Vehicles — static routes MUST come before :id wildcard */}
          <Route path="/vehicles" element={<VehicleListingPage />} />
          <Route path="/vehicles/create" element={<ProtectedRoute><VehicleCreatePage /></ProtectedRoute>} />
          <Route path="/vehicles/register" element={<ProtectedRoute><VehicleRegistrationPage /></ProtectedRoute>} />
          <Route path="/vehicles/edit/:id" element={<ProtectedRoute><VehicleEditPage /></ProtectedRoute>} />
          <Route path="/vehicles/book/:id" element={<ProtectedRoute><BookingCreatePage bookingType="vehicle" /></ProtectedRoute>} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />

          {/* Drivers — static routes MUST come before :id wildcard */}
          <Route path="/drivers" element={<DriverListingPage />} />
          <Route path="/drivers/register" element={<ProtectedRoute><DriverRegistrationPage /></ProtectedRoute>} />
          <Route path="/drivers/book/:id" element={<ProtectedRoute><BookingCreatePage bookingType="driver" /></ProtectedRoute>} />
          <Route path="/drivers/:id" element={<DriverDetailsPage />} />

          {/* Trip Planner — optional tool */}
          <Route path="/trip" element={<TripPlannerPage />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><UserBookingDashboard /></ProtectedRoute>} />
          <Route path="/availability" element={<ProtectedRoute><DriverAvailability /></ProtectedRoute>} />
          <Route path="/reviews/new" element={<ProtectedRoute><ReviewCreatePage /></ProtectedRoute>} />
          <Route path="/professional" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
          <Route path="/earnings" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />

          {/* Self-Drive Rentals */}
          <Route path="/customer/rentals" element={<ProtectedRoute><CustomerRentalsList /></ProtectedRoute>} />
          <Route path="/customer/rentals/apply" element={<ProtectedRoute><CustomerRentalApply /></ProtectedRoute>} />
          <Route path="/customer/rentals/:id" element={<ProtectedRoute><CustomerRentalDetails /></ProtectedRoute>} />
          <Route path="/customer/rentals/:id/active" element={<ProtectedRoute><CustomerActiveRental /></ProtectedRoute>} />
          <Route path="/owner/rental-requests" element={<ProtectedRoute><OwnerRentalRequests /></ProtectedRoute>} />
          <Route path="/owner/rental-requests/:id" element={<ProtectedRoute><OwnerRentalReview /></ProtectedRoute>} />
          <Route path="/owner/rentals/:id/return" element={<ProtectedRoute><OwnerRentalReturn /></ProtectedRoute>} />

          {/* AI Tools — public pages */}
          <Route path="/ai/driver-matching" element={<AIDriverMatching />} />
          <Route path="/ai/vehicle-recommendation" element={<AIVehicleRecommendation />} />
          <Route path="/ai/chatbot" element={<AIChatbot />} />
          <Route path="/ai/safety" element={<SafetyMonitoring />} />
          <Route path="/ai/demand" element={<DemandPrediction />} />

          {/* Admin Operations Center Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ProtectedRoute requireAdmin={true}><AdminCommandCenter /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute requireAdmin={true}><AdminCommandCenter /></ProtectedRoute>} />
            <Route path="search" element={<ProtectedRoute requireAdmin={true}><AdminGlobalSearch /></ProtectedRoute>} />
            
            {/* Approvals & Verifications */}
            <Route path="driver-approvals" element={<ProtectedRoute requireAdmin={true}><DriverApprovalCenter /></ProtectedRoute>} />
            <Route path="vehicle-approvals" element={<ProtectedRoute requireAdmin={true}><VehicleApprovalCenter /></ProtectedRoute>} />
            <Route path="owner-approvals" element={<ProtectedRoute requireAdmin={true}><OwnerApprovalCenter /></ProtectedRoute>} />

            {/* Live Operations & Fleets */}
            <Route path="live" element={<ProtectedRoute requireAdmin={true}><LiveOperationsCenter /></ProtectedRoute>} />
            <Route path="fleet" element={<ProtectedRoute requireAdmin={true}><FleetManagementCenter /></ProtectedRoute>} />
            <Route path="drivers" element={<ProtectedRoute requireAdmin={true}><DriverManagementCenter /></ProtectedRoute>} />

            {/* Users & Directory */}
            <Route path="users" element={<ProtectedRoute requireAdmin={true}><UserManagementCenter /></ProtectedRoute>} />

            {/* Bookings & Rentals */}
            <Route path="booking-approvals" element={<ProtectedRoute requireAdmin={true}><BookingApprovals /></ProtectedRoute>} />
            <Route path="booking-management" element={<ProtectedRoute requireAdmin={true}><BookingManagement /></ProtectedRoute>} />
            <Route path="rentals" element={<ProtectedRoute requireAdmin={true}><RentalOperationsCenter /></ProtectedRoute>} />

            {/* Financial Center */}
            <Route path="finance" element={<ProtectedRoute requireAdmin={true}><FinancialCommandCenter /></ProtectedRoute>} />

            {/* Safety & Trust */}
            <Route path="safety/complaints" element={<ProtectedRoute requireAdmin={true}><SafetyTrustCenter /></ProtectedRoute>} />
            <Route path="reviews" element={<ProtectedRoute requireAdmin={true}><ReviewManagement /></ProtectedRoute>} />
            <Route path="rejected" element={<ProtectedRoute requireAdmin={true}><RejectedItems /></ProtectedRoute>} />

            {/* Intelligence */}
            <Route path="analytics" element={<ProtectedRoute requireAdmin={true}><AnalyticsCenter /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute requireAdmin={true}><ReportsCenter /></ProtectedRoute>} />

            {/* System & Compliance */}
            <Route path="audit-logs" element={<ProtectedRoute requireAdmin={true}><AuditLogCenter /></ProtectedRoute>} />
            <Route path="system-health" element={<ProtectedRoute requireAdmin={true}><SystemHealthCenter /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requireAdmin={true}><PlatformSettingsCenter /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute requireAdmin={true}><AdminProfile /></ProtectedRoute>} />
            <Route path="admin-management" element={<ProtectedRoute requireSuperAdmin={true}><AdminManagement /></ProtectedRoute>} />

            {/* Legacy AI Routes */}
            <Route path="ai/driver-matching" element={<ProtectedRoute requireAdmin={true}><AIDriverMatching /></ProtectedRoute>} />
            <Route path="ai/safety" element={<ProtectedRoute requireAdmin={true}><SafetyMonitoring /></ProtectedRoute>} />
            <Route path="ai/demand" element={<ProtectedRoute requireAdmin={true}><DemandPrediction /></ProtectedRoute>} />

            {/* Admin 404 Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <AppContent />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
