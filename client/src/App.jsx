import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HusseinAIWidget from "./components/HusseinAIWidget";
import AdminRoute from "./components/auth/AdminRoute";
import PlanFeatureGate from "./components/auth/PlanFeatureGate";
import OfflineStatusBanner from "./components/layout/OfflineStatusBanner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Load large finance screens only when a user navigates to them.
const WithholdingTax = lazy(() => import("./pages/admin/finance/WithholdingTax"));
const AccountingCompletionCenter = lazy(() => import("./pages/admin/finance/AccountingCompletionCenter"));
const AccountingControlReports = lazy(() => import("./pages/admin/finance/AccountingControlReports"));
const AccountingSubledgers = lazy(() => import("./pages/admin/finance/AccountingSubledgers"));

export default function App() {
  // The current path determines whether a specialised finance screen replaces the normal router.
  const location = useLocation();
  const withholding = location.pathname === "/admin/finance/withholding-tax";
  const accountingCompletion = location.pathname === "/admin/finance/accounting/completion";
  const accountingReports = location.pathname === "/admin/finance/accounting/control-reports";
  const accountingSubledgers = location.pathname === "/admin/finance/accounting/subledgers";
  const bareAdmin = withholding || accountingCompletion || accountingReports || accountingSubledgers;

  // Keep specialised routes behind the same admin guard and show a loading state while lazy imports resolve.
  const content = withholding
    ? <AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><WithholdingTax /></Suspense></AdminRoute>
    : accountingCompletion
      ? <AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingCompletionCenter /></Suspense></AdminRoute>
      : accountingReports
        ? <AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingControlReports /></Suspense></AdminRoute>
        : accountingSubledgers
          ? <AdminRoute><Suspense fallback={<div className="p-8">Loading...</div>}><AccountingSubledgers /></Suspense></AdminRoute>
          : <AppRoutes />;

  // Staff and finance workspaces use their own layouts; public/customer routes use the shared navbar and footer.
  const isStaffWorkspace = ["/admin", "/superadmin", "/agent", "/tour-manager", "/guide", "/driver"]
    .some((prefix) => location.pathname.startsWith(prefix));
  const showFooter = !isStaffWorkspace;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Keep connectivity warnings visible regardless of the current route. */}
      <OfflineStatusBanner />
      {!bareAdmin && <Navbar />}
      <main className="flex-1">
        {/* Enforce subscription feature access around the active route content. */}
        <PlanFeatureGate>{content}</PlanFeatureGate>
      </main>
      {showFooter && <Footer />}
      <HusseinAIWidget />
      {/* Centralise toast notifications so API feedback appears consistently across pages. */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
    </div>
  );
}
