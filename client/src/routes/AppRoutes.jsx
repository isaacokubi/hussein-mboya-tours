import { Navigate, Route, Routes } from "react-router-dom";

// Public pages
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

// Customer pages
import Dashboard from "../pages/Dashboard";
import MyBookings from "../pages/MyBookings";
import BookingDetails from "../pages/BookingDetails";
import Profile from "../pages/Profile";
import Checkout from "../pages/Checkout";
import PaymentStatus from "../pages/PaymentStatus";

// Agent pages
import AgentLayout from "../layouts/AgentLayout";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentBookings from "../pages/agent/AgentBookings";
import AgentCustomers from "../pages/agent/AgentCustomers";

// Guide pages
import TourGuideDashboard from "../pages/guide/TourGuideDashboard";

// Tour manager pages
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

// Admin pages
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
import AdminFinance from "../pages/admin/finance/AdminFinance";
import FinanceReports from "../pages/admin/finance/FinanceReports";
import MpesaTransactions from "../pages/admin/finance/MpesaTransactions";
import Commissions from "../pages/admin/finance/Commissions";
import Reconciliation from "../pages/admin/finance/Reconciliation";
import Reports from "../pages/admin/Reports";
import Agents from "../pages/admin/Agents";
import RolesPage from "../pages/rbac/RolesPage";
import AdminSystemHealth from "../pages/admin/AdminSystemHealth";

// Route guards
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";
import AgentRoute from "../components/agent/AgentRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route
        path="/tours/category/:slug"
        element={<Tours />}
      />
      <Route
        path="/tours/:slug"
        element={<TourDetails />}
      />

      <Route
        path="/destinations"
        element={<Destinations />}
      />
      <Route
        path="/destinations/:slug"
        element={<DestinationDetails />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/agent/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/airport-transfers"
        element={<AirportTransfers />}
      />

      <Route
        path="/privacy"
        element={<PolicyPage type="privacy" />}
      />
      <Route
        path="/terms"
        element={<PolicyPage type="terms" />}
      />
      <Route
        path="/refund-policy"
        element={<PolicyPage type="refund" />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />
      <Route
        path="/admin/unauthorized"
        element={<Unauthorized />}
      />

      {/* Customer */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute roles={["customer", "admin", "manager", "guide", "agent"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/dashboard"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/:id"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment-status/:id"
        element={
          <ProtectedRoute>
            <PaymentStatus />
          </ProtectedRoute>
        }
      />

      {/* Agent */}
      <Route
        path="/agent"
        element={
          <AgentRoute>
            <AgentLayout />
          </AgentRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route
          path="dashboard"
          element={<AgentDashboard />}
        />
        <Route
          path="bookings"
          element={<AgentBookings />}
        />
        <Route
          path="customers"
          element={<AgentCustomers />}
        />
      </Route>

      {/* Guide */}
      <Route
        path="/guide"
        element={<Navigate to="/guide/dashboard" replace />}
      />

      <Route
        path="/guide/dashboard"
        element={
          <ProtectedRoute roles={["guide", "admin"]}>
            <TourGuideDashboard />
          </ProtectedRoute>
        }
      />

      {/* Tour Manager */}
      <Route
        path="/tour-manager"
        element={
          <ProtectedRoute
            roles={[
              "manager",
              "tour_manager",
              "tourmanager",
              "admin",
            ]}
          >
            <TourManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<TourManagerDashboard />}
        />
        <Route
          path="dashboard"
          element={<TourManagerDashboard />}
        />
        <Route
          path="tours"
          element={<TourManagerTours />}
        />
        <Route
          path="create-tour"
          element={<CreateTour />}
        />
        <Route
          path="edit-tour/:id"
          element={<EditTour />}
        />
        <Route
          path="guides"
          element={<AssignGuides />}
        />
        <Route
          path="assign-guide/:id"
          element={<AssignGuide />}
        />
        <Route
          path="assign-vehicle/:id"
          element={<AssignVehicle />}
        />
        <Route
          path="assignments"
          element={<TourAssignments />}
        />
        <Route
          path="availability/:id"
          element={<TourAvailability />}
        />
        <Route
          path="vehicles"
          element={<TourManagerVehicles />}
        />
        <Route
          path="calendar"
          element={<TourManagerCalendar />}
        />
        <Route
          path="bookings"
          element={<TourManagerBookings />}
        />
        <Route
          path="customers"
          element={<TourManagerCustomers />}
        />
        <Route
          path="analytics"
          element={<TourAnalytics />}
        />
        <Route
          path="reports"
          element={<TourReports />}
        />
      </Route>

      {/* Manager compatibility */}
      <Route
        path="/manager/dashboard"
        element={
          <Navigate
            to="/tour-manager/dashboard"
            replace
          />
        }
      />

      {/* Legacy manager compatibility aliases */}
      <Route path="/manager/dashboard" element={<Navigate to="/tour-manager/dashboard" replace />} />
      <Route path="/manager/tours" element={<Navigate to="/tour-manager/tours" replace />} />
      <Route path="/manager/create-tour" element={<Navigate to="/tour-manager/create-tour" replace />} />
      <Route path="/manager/edit-tour/:id" element={<Navigate to="/tour-manager/edit-tour/:id" replace />} />
      <Route path="/manager/guides" element={<Navigate to="/tour-manager/guides" replace />} />
      <Route path="/manager/assignments" element={<Navigate to="/tour-manager/assignments" replace />} />
      <Route path="/manager/vehicles" element={<Navigate to="/tour-manager/vehicles" replace />} />
      <Route path="/manager/calendar" element={<Navigate to="/tour-manager/calendar" replace />} />
      <Route path="/manager/bookings" element={<Navigate to="/tour-manager/bookings" replace />} />
      <Route path="/manager/customers" element={<Navigate to="/tour-manager/customers" replace />} />
      <Route path="/manager/analytics" element={<Navigate to="/tour-manager/analytics" replace />} />
      <Route path="/manager/reports" element={<Navigate to="/tour-manager/reports" replace />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="users"
          element={<UserManagement />}
        />
        <Route
          path="staff"
          element={<StaffManagement />}
        />
        <Route
          path="manage-tours"
          element={<TourManagement />}
        />
        <Route
          path="tours/add"
          element={<AddTour />}
        />
        <Route
          path="tours/edit/:id"
          element={<EditTour />}
        />
        <Route
          path="destinations"
          element={<DestinationManagement />}
        />
        <Route
          path="create-destination"
          element={<CreateDestination />}
        />
        <Route
          path="edit-destination/:id"
          element={<EditDestination />}
        />
        <Route
          path="bookings"
          element={<BookingManagement />}
        />
        <Route
          path="payments"
          element={<AdminPayments />}
        />
        <Route
          path="agents"
          element={<Agents />}
        />
        <Route
          path="commissions"
          element={<Commissions />}
        />
        <Route
          path="customers"
          element={<AdminCustomers />}
        />
        <Route
          path="guides"
          element={<AdminGuides />}
        />
        <Route
          path="vehicles"
          element={<AdminVehicles />}
        />
        <Route
          path="coupons"
          element={<AdminCoupons />}
        />
        <Route
          path="reviews"
          element={<AdminReviews />}
        />
        <Route
          path="gallery"
          element={<AdminGallery />}
        />
        <Route
          path="reports"
          element={<Reports />}
        />
        <Route
          path="analytics"
          element={<AdminAnalytics />}
        />
        <Route
          path="ai"
          element={<AdminAITools />}
        />
        <Route
          path="notifications"
          element={<AdminNotifications />}
        />
        <Route
          path="settings"
          element={<AdminSettings />}
        />
        <Route
          path="finance/reconciliation"
          element={<Reconciliation />}
        />
        <Route
          path="system-health"
          element={<AdminSystemHealth />}
        />
        <Route
          path="finance"
          element={<AdminFinance />}
        />
        <Route
          path="finance/transactions"
          element={<MpesaTransactions />}
        />
        <Route
          path="finance/reports"
          element={<FinanceReports />}
        />
        <Route
          path="roles"
          element={<RolesPage />}
        />
        <Route
          path="rbac"
          element={<RolesPage />}
        />
      </Route>

      {/* Compatibility alias */}
      <Route
        path="/admin/tours"
        element={
          <Navigate
            to="/admin/manage-tours"
            replace
          />
        }
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1>404</h1>
      <p>The page you requested does not exist.</p>

      <button
        type="button"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Return Home
      </button>
    </div>
  );
}
