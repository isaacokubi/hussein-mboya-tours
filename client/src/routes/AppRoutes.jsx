import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Home from "../pages/Home";
import Tours from "../pages/Tours";
import TourDetails from "../pages/TourDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Destinations from "../pages/Destinations";
import Wishlist from "../pages/Wishlist";
import DestinationDetails from "../pages/DestinationDetails";
import About from "../pages/About";
import Contact from "../pages/Contact";
import AirportTransfers from "../pages/AirportTransfers";
import PolicyPage from "../pages/PolicyPage";
import Unauthorized from "../pages/Unauthorized";

// Customer
import Dashboard from "../pages/Dashboard";
import BookingDetails from "../pages/BookingDetails";
import Profile from "../pages/Profile";
import Checkout from "../pages/Checkout";
import PaymentStatus from "../pages/PaymentStatus";

// Agent
import AgentLayout from "../layouts/AgentLayout";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentBookings from "../pages/agent/AgentBookings";
import AgentCustomers from "../pages/agent/AgentCustomers";

// Guide
import TourGuideDashboard from "../pages/guide/TourGuideDashboard";

// Tour manager
import TourManagerLayout from "../layouts/TourManagerLayout";
import TourManagerDashboard from "../pages/tourManager/TourManagerDashboard";
import TourManagerTours from "../pages/tourManager/TourManagerTours";
import CreateTour from "../pages/tourManager/CreateTour";
import EditTour from "../pages/tourManager/EditTour";
import AssignGuides from "../pages/tourManager/AssignGuides";
import AssignGuide from "../pages/tourManager/AssignGuide";
import AssignVehicle from "../pages/tourManager/AssignVehicle";
import TourManagerVehicles from "../pages/tourManager/Vehicles";
import TourAvailability from "../pages/tourManager/TourAvailability";
import TourAnalytics from "../pages/tourManager/TourAnalytics";
import TourAssignments from "../pages/tourManager/TourAssignments";
import TourReports from "../pages/tourManager/TourReports";
import TourManagerCalendar from "../pages/tourManager/TourManagerCalendar";
import TourManagerBookings from "../pages/tourManager/TourManagerBookings";
import TourManagerCustomers from "../pages/tourManager/TourManagerCustomers";

// Admin
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import TourManagement from "../pages/admin/TourManagement";
import AddTour from "../pages/admin/AddTour";
import DestinationManagement from "../pages/admin/DestinationManagement";
import CreateDestination from "../pages/admin/CreateDestination";
import EditDestination from "../pages/admin/EditDestination";
import BookingManagement from "../pages/admin/BookingManagement";
import StaffManagement from "../pages/admin/StaffManagement";
import AdminCustomers from "../pages/admin/Customers";
import AdminVehicles from "../pages/admin/AdminVehicles";
import AdminGuides from "../pages/admin/AdminGuides";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminGallery from "../pages/admin/AdminGallery";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminAITools from "../pages/admin/AdminAITools";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminPayments from "../pages/admin/payments/AdminPayments";
import Commissions from "../pages/admin/finance/Commissions";
import Reconciliation from "../pages/admin/finance/Reconciliation";
import Reports from "../pages/admin/Reports";
import Agents from "../pages/admin/Agents";
import RolesPage from "../pages/rbac/RolesPage";
import AdminSystemHealth from "../pages/admin/AdminSystemHealth";

// Guards
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";
import AgentRoute from "../components/agent/AgentRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/category/:slug" element={<Tours />} />
      <Route path="/tours/:slug" element={<TourDetails />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/destinations/:slug" element={<DestinationDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/agent/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/airport-transfers" element={<AirportTransfers />} />
      <Route path="/privacy" element={<PolicyPage type="privacy" />} />
      <Route path="/terms" element={<PolicyPage type="terms" />} />
      <Route path="/refund-policy" element={<PolicyPage type="refund" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/admin/unauthorized" element={<Unauthorized />} />

      {/* Customer */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/payment-status/:id" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />

      {/* Agent */}
      <Route path="/agent" element={<AgentRoute><AgentLayout /></AgentRoute>}>
        <Route index element={<AgentDashboard />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="bookings" element={<AgentBookings />} />
        <Route path="customers" element={<AgentCustomers />} />
      </Route>

      {/* Guide */}
      <Route
        path="/guide/dashboard"
        element={<ProtectedRoute roles={["guide", "admin"]}><TourGuideDashboard /></ProtectedRoute>}
      />

      {/* Tour manager */}
      <Route
        path="/tour-manager"
        element={<ProtectedRoute roles={["manager", "tour_manager", "tourmanager", "admin"]}><TourManagerLayout /></ProtectedRoute>}
      >
        <Route index element={<TourManagerDashboard />} />
        <Route path="dashboard" element={<TourManagerDashboard />} />
        <Route path="tours" element={<TourManagerTours />} />
        <Route path="create-tour" element={<CreateTour />} />
        <Route path="edit-tour/:id" element={<EditTour />} />
        <Route path="guides" element={<AssignGuides />} />
        <Route path="assign-guide/:id" element={<AssignGuide />} />
        <Route path="assign-vehicle/:id" element={<AssignVehicle />} />
        <Route path="assignments" element={<TourAssignments />} />
        <Route path="availability/:id" element={<TourAvailability />} />
        <Route path="vehicles" element={<TourManagerVehicles />} />
        <Route path="calendar" element={<TourManagerCalendar />} />
        <Route path="bookings" element={<TourManagerBookings />} />
        <Route path="customers" element={<TourManagerCustomers />} />
        <Route path="analytics" element={<TourAnalytics />} />
        <Route path="reports" element={<TourReports />} />
      </Route>
      <Route path="/manager/dashboard" element={<Navigate to="/tour-manager/dashboard" replace />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="manage-tours" element={<TourManagement />} />
        <Route path="tours/add" element={<AddTour />} />
        <Route path="destinations" element={<DestinationManagement />} />
        <Route path="create-destination" element={<CreateDestination />} />
        <Route path="edit-destination/:id" element={<EditDestination />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="agents" element={<Agents />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="guides" element={<AdminGuides />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="ai" element={<AdminAITools />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="finance/reconciliation" element={<Reconciliation />} />
        <Route path="system-health" element={<AdminSystemHealth />} />
      </Route>

      {/* Compatibility aliases used by older components */}
      <Route path="/admin/tours" element={<Navigate to="/admin/manage-tours" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="mt-3 text-gray-600">The page you requested does not exist.</p>
        <a className="inline-block mt-6 px-5 py-3 rounded-lg bg-blue-600 text-white" href="/">
          Return Home
        </a>
      </div>
    </div>
  );
}
