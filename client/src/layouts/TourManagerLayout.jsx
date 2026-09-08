import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import TourManagerSidebar from "../components/tourManager/TourManagerSidebar";
import { useAuth } from "../context/AuthContext";
import { getUserRole } from "../utils/roleUtils";

const TourManagerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const role = getUserRole(user);
  useEffect(() => { const timer = setTimeout(() => setMobileOpen(false), 0); return () => clearTimeout(timer); }, [location]);
  if (role === "admin" || role === "super_admin") return <Navigate to="/admin/dashboard" replace />;

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
        <header className="ops-header lg:hidden"><div className="flex min-w-0 items-center gap-2 sm:gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="ops-mobile-trigger shrink-0" aria-label="Open Tour Manager navigation" aria-expanded={mobileOpen}><Menu size={20} /></button><div className="min-w-0"><div className="truncate text-sm font-semibold sm:text-base">Tour Manager</div><div className="truncate text-[10px] sm:text-xs">Tour Operations</div></div></div></header>
        <main className="ops-content min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
};
export default TourManagerLayout;
