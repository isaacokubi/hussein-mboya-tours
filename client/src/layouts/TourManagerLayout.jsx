/**
 * Purpose: Tour Manager Layout client application module. Main declarations: TourManagerLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load lucide-react so this module can use its exported dependencies.
import { Menu, X } from "lucide-react";
// Load react-router-dom so this module can use its exported dependencies.
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Load ../components/tourManager/TourManagerSidebar so this module can use its exported dependencies.
import TourManagerSidebar from "../components/tourManager/TourManagerSidebar";
// Load ../components/common/DashboardLogoutButton so this module can use its exported dependencies.
import DashboardLogoutButton from "../components/common/DashboardLogoutButton";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../context/AuthContext";
// Load ../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils";

// Declare TourManagerLayout for use by the surrounding module or function.
const TourManagerLayout = () => {
  // Declare [mobileOpen, setMobileOpen] for use by the surrounding module or function.
  const [mobileOpen, setMobileOpen] = useState(false);
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => { const timer = setTimeout(() => setMobileOpen(false), 0); return () => clearTimeout(timer); }, [location]);
  // Check the condition (role === "admin" || role === "super_admin") and run the matching branch.
  if (role === "admin" || role === "super_admin") return <Navigate to="/admin/dashboard" replace />;

  // Return the expression shown below to the caller.
  return (
    <div className="dashboard-responsive ops-shell min-h-screen">
      <aside className="ops-sidebar hidden lg:block" aria-label="Tour Manager navigation"><TourManagerSidebar /></aside>
      {mobileOpen && (
        <div className="ops-drawer open lg:hidden" role="dialog" aria-modal="true" aria-label="Tour Manager navigation">
          <div className="ops-drawer-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="ops-drawer-panel"><TourManagerSidebar /><button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="Close navigation"><X size={19} /></button></aside>
        </div>
      )}
      <div className="ops-main flex min-w-0 flex-1 flex-col">
        <header className="ops-header flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2 sm:gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="ops-mobile-trigger shrink-0 lg:hidden" aria-label="Open Tour Manager navigation" aria-expanded={mobileOpen}><Menu size={20} /></button><div className="min-w-0"><div className="truncate text-sm font-semibold sm:text-base">Tour Manager</div><div className="truncate text-[10px] sm:text-xs">Tour Operations</div></div></div><DashboardLogoutButton /></header>
        <main className="ops-content min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
};
export default TourManagerLayout;
