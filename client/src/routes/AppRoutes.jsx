import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Public pages
const Home = lazy(() => import("../pages/Home"));
const Tours = lazy(() => import("../pages/Tours"));
const TourDetails = lazy(() => import("../pages/TourDetails"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const Destinations = lazy(() => import("../pages/Destinations"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const DestinationDetails = lazy(() => import("../pages/DestinationDetails"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const AirportTransfers = lazy(() => import("../pages/AirportTransfers"));
const PolicyPage = lazy(() => import("../pages/PolicyPage"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
// Customer pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const MyBookings = lazy(() => import("../pages/MyBookings"));
const BookingDetails = lazy(() => import("../pages/BookingDetails"));
const Profile = lazy(() => import("../pages/Profile"));
const Checkout = lazy(() => import("../pages/Checkout"));
const CustomTourRequest = lazy(() => import("../pages/CustomTourRequest"));
const PaymentStatus = lazy(() => import("../pages/PaymentStatus"));
// Agent pages
const AgentLayout = lazy(() => import("../layouts/AgentLayout"));
const AgentDashboard = lazy(() => import("../pages/agent/AgentDashboard"));
const AgentBookings = lazy(() => import("../pages/agent/AgentBookings"));
const AgentCustomers = lazy(() => import("../pages/agent/AgentCustomers"));
const AgentCommission = lazy(() => import("../pages/agent/AgentCommission"));
const AgentQuotes = lazy(() => import("../pages/agent/AgentQuotes"));
// Guide pages
const TourGuideDashboard = lazy(() => import("../pages/guide/TourGuideDashboard"));
const DriverDashboard = lazy(() => import("../pages/driver/DriverDashboard"));
// Tour manager pages
const TourManagerLayout = lazy(() => import("../layouts/TourManagerLayout"));
const TourManagerDashboard = lazy(() => import("../pages/tourManager/TourManagerDashboard"));
const TourManagerTours = lazy(() => import("../pages/tourManager/TourManagerTours"));
const CreateTour = lazy(() => import("../pages/tourManager/CreateTour"));
const EditTour = lazy(() => import("../pages/tourManager/EditTour"));

const AssignGuide = lazy(() => import("../pages/tourManager/AssignGuide"));
const AssignVehicle = lazy(() => import("../pages/tourManager/AssignVehicle"));
const TourManagerVehicles = lazy(() => import("../pages/tourManager/Vehicles"));
const TourAvailability = lazy(() => import("../pages/tourManager/TourAvailability"));
const TourAnalytics = lazy(() => import("../pages/tourManager/TourAnalytics"));
const TourAssignments = lazy(() => import("../pages/tourManager/TourAssignments"));
const TourReports = lazy(() => import("../pages/tourManager/TourReports"));
const TourManagerCalendar = lazy(() => import("../pages/tourManager/TourManagerCalendar"));
const TourManagerBookings = lazy(() => import("../pages/tourManager/TourManagerBookings"));
const TourManagerCustomers = lazy(() => import("../pages/tourManager/TourManagerCustomers"));
const TourManagerGuides = lazy(() => import("../pages/tourManager/TourManagerGuides"));
// Admin pages
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const SuperAdminLayout = lazy(() => import("../layouts/SuperAdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/SuperAdminDashboard"));
const SuperAdminUsers = lazy(() => import("../pages/superadmin/SuperAdminUsers"));
const SuperAdminRoles = lazy(() => import("../pages/superadmin/SuperAdminRoles"));
const SuperAdminSystem = lazy(() => import("../pages/superadmin/SuperAdminSystem"));
const SuperAdminAudit = lazy(() => import("../pages/superadmin/SuperAdminAudit"));
const SuperAdminSecurity = lazy(() => import("../pages/superadmin/SuperAdminSecurity"));

const SuperAdminSettings =
lazy(()=>import("../pages/superadmin/SuperAdminSettings"));

const SuperAdminDatabase =
lazy(()=>import("../pages/superadmin/SuperAdminDatabase"));

const SuperAdminApiMonitor =
lazy(()=>import("../pages/superadmin/SuperAdminApiMonitor"));

const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const TourManagement = lazy(() => import("../pages/admin/TourManagement"));
const AddTour = lazy(() => import("../pages/admin/AddTour"));
const DestinationManagement = lazy(() => import("../pages/admin/DestinationManagement"));
const CreateDestination = lazy(() => import("../pages/admin/CreateDestination"));
const EditDestination = lazy(() => import("../pages/admin/EditDestination"));
const AdminDestinationDetails = lazy(() => import("../pages/admin/DestinationDetails"));
const BookingManagement = lazy(() => import("../pages/admin/BookingManagement"));
const StaffManagement = lazy(() => import("../pages/admin/StaffManagement"));
const AdminCustomers = lazy(() => import("../pages/admin/Customers"));
const AdminCustomerDetails = lazy(() => import("../pages/admin/CustomerDetails"));
const AdminVehicles = lazy(() => import("../pages/admin/AdminVehicles"));
const AdminGuides = lazy(() => import("../pages/admin/AdminGuides"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));
const AdminGallery = lazy(() => import("../pages/admin/AdminGallery"));
const AdminCoupons = lazy(() => import("../pages/admin/AdminCoupons"));
const AdminNotifications = lazy(() => import("../pages/admin/AdminNotifications"));
const AdminAITools = lazy(() => import("../pages/admin/AdminAITools"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminPayments = lazy(() => import("../pages/admin/payments/AdminPayments"));
const AdminFinance = lazy(() => import("../pages/admin/finance/AdminFinance"));
const FinanceReports = lazy(() => import("../pages/admin/finance/FinanceReports"));
const MpesaTransactions = lazy(() => import("../pages/admin/finance/MpesaTransactions"));
const Commissions = lazy(() => import("../pages/admin/finance/Commissions"));
const Reconciliation = lazy(() => import("../pages/admin/finance/Reconciliation"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Agents = lazy(() => import("../pages/admin/Agents"));
const RolesPage = lazy(() => import("../pages/rbac/RolesPage"));
const AdminSystemHealth = lazy(() => import("../pages/admin/AdminSystemHealth"));
const CustomTourRequests = lazy(() => import("../pages/admin/CustomTourRequests"));
// Route guards
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";
import AgentRoute from "../components/agent/AgentRoute";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          Loading...
        </div>
      }
    >
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
      <Route path="/forgot-password" element={<ForgotPassword />} />

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

      <Route path="/custom-tour" element={<ProtectedRoute><CustomTourRequest /></ProtectedRoute>} />

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
        <Route path="commission" element={<AgentCommission />} />
        <Route path="quotes" element={<AgentQuotes />} />
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

      {/* Driver */}
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute roles={["driver", "admin"]}>
            <DriverDashboard />
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
          element={<TourManagerGuides />}
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



{/* Super Admin */}
<Route
path="/superadmin"
element={
<ProtectedRoute roles={[
"super_admin",
"superadmin"
]}>
<SuperAdminLayout />
</ProtectedRoute>
}
>

<Route
index
element={<SuperAdminDashboard />}
/>

<Route
path="dashboard"
element={<SuperAdminDashboard />}
/>



<Route
path="users"
element={<SuperAdminUsers />}
/>


<Route
path="audit"
element={<SuperAdminAudit />}
/>

<Route
path="security"
element={<SuperAdminSecurity />}
/>

<Route
path="roles"
element={<SuperAdminRoles />}
/>

<Route
path="system"
element={<SuperAdminSystem />}
/>

</Route>





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
          path="destinations/:id"
          element={<AdminDestinationDetails />}
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
          path="customers/:id"
          element={<AdminCustomerDetails />}
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
        <Route
          path="custom-tour-requests"
          element={<CustomTourRequests />}
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
    </Suspense>
    </>
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
