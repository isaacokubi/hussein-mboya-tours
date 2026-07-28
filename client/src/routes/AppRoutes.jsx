// client/src/routes/AppRoutes.jsx

import { Routes, Route } from "react-router-dom";

// ============================================================
// PUBLIC
// ============================================================

import Home from "../pages/Home";
import Tours from "../pages/Tours";
import TourDetails from "../pages/TourDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Destinations from "../pages/Destinations";
import Wishlist from "../pages/Wishlist";

// ============================================================
// CUSTOMER
// ============================================================

import Dashboard from "../pages/Dashboard";
import MyBookings from "../pages/MyBookings";
import BookingDetails from "../pages/BookingDetails";
import Profile from "../pages/Profile";
import Checkout from "../pages/Checkout";
import PaymentStatus from "../pages/PaymentStatus";

// ============================================================
// AGENT
// ============================================================

import AgentLayout from "../layouts/AgentLayout";
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentBookings from "../pages/agent/AgentBookings";
import AgentCustomers from "../pages/agent/AgentCustomers";

// ============================================================
// TOUR GUIDE
// ============================================================

import TourGuideDashboard from "../pages/guide/TourGuideDashboard";

// ============================================================
// TOUR MANAGER
// ============================================================

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
import TourReports from "../pages/tourManager/TourReports";
import TourAssignments from "../pages/tourManager/TourAssignments";

// ============================================================
// ADMIN
// ============================================================

import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageTours from "../pages/admin/ManageTours";
import AddTour from "../pages/admin/AddTour";
import ManageBookings from "../pages/admin/ManageBookings";
import Customers from "../pages/admin/Customers";
import Vehicles from "../pages/admin/Vehicles";
import AdminAnalytics from "../pages/admin/AdminAnalytics";

// ============================================================
// ADMIN FINANCE
// ============================================================

import AdminFinance from "../pages/admin/finance/AdminFinance";
import MpesaTransactions from "../pages/admin/finance/MpesaTransactions";
import FinanceReports from "../pages/admin/finance/FinanceReports";

// ============================================================
// ROUTE GUARDS
// ============================================================

import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";
import AgentRoute from "../components/agent/AgentRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ============================================================
          PUBLIC ROUTES
      ============================================================ */}

      <Route path="/" element={<Home />} />

      <Route path="/tours" element={<Tours />} />

      <Route path="/tours/:id" element={<TourDetails />} />

      <Route path="/destinations" element={<Destinations />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/wishlist" element={<Wishlist />} />

      {/* ============================================================
          CUSTOMER ROUTES
      ============================================================ */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
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

      {/* ============================================================
          AGENT ROUTES
      ============================================================ */}

      <Route
        path="/agent"
        element={
          <AgentRoute>
            <AgentLayout />
          </AgentRoute>
        }
      >
        <Route index element={<AgentDashboard />} />

        <Route path="bookings" element={<AgentBookings />} />

        <Route path="customers" element={<AgentCustomers />} />
      </Route>

      {/* ============================================================
          TOUR GUIDE
      ============================================================ */}

      <Route
        path="/guide/dashboard"
        element={
          <ProtectedRoute roles={["tour_guide", "admin"]}>
            <TourGuideDashboard />
          </ProtectedRoute>
        }
      />

      {/* ============================================================
          TOUR MANAGER
      ============================================================ */}

      <Route
        path="/tour-manager"
        element={
          <ProtectedRoute roles={["tour_manager", "admin"]}>
            <TourManagerLayout />
          </ProtectedRoute>
        }
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

        <Route path="analytics" element={<TourAnalytics />} />

        <Route path="reports" element={<TourReports />} />
      </Route>

      {/* ============================================================
          ADMIN ROUTES
      ============================================================ */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* TOURS */}

        <Route path="tours" element={<ManageTours />} />

        <Route path="tours/add" element={<AddTour />} />

        {/* BOOKINGS */}

        <Route path="bookings" element={<ManageBookings />} />

        {/* FINANCE */}

        <Route path="finance" element={<AdminFinance />} />

        <Route
          path="finance/transactions"
          element={<MpesaTransactions />}
        />

        <Route
          path="finance/reports"
          element={<FinanceReports />}
        />

        {/* ANALYTICS */}

        <Route
          path="analytics"
          element={<AdminAnalytics />}
        />

        {/* CUSTOMERS */}

        <Route
          path="customers"
          element={<Customers />}
        />

        {/* GUIDES */}

        <Route
          path="guides"
          element={
            <div>
              <h1>Manage Guides</h1>
            </div>
          }
        />

        {/* VEHICLES */}

        <Route
          path="vehicles"
          element={<Vehicles />}
        />

        {/* SETTINGS */}

        <Route
          path="settings"
          element={
            <div>
              <h1>Admin Settings</h1>
            </div>
          }
        />
      </Route>

      {/* ============================================================
          404
      ============================================================ */}

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold">
              404 - Page Not Found
            </h1>
          </div>
        }
      />
    </Routes>
  );
}