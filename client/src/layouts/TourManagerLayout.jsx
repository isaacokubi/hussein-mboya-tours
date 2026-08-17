import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import TourManagerSidebar from "../components/tourManager/TourManagerSidebar";

const TourManagerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="ops-shell min-h-screen">
      {/* Desktop sidebar */}
      <aside className="ops-sidebar hidden lg:block" aria-label="Tour Manager navigation">
        <TourManagerSidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="ops-drawer open lg:hidden" role="dialog" aria-modal="true" aria-label="Tour Manager navigation">
          <div
            className="ops-drawer-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="ops-drawer-panel">
            <TourManagerSidebar />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close navigation"
            >
              <X size={21} />
            </button>
          </aside>
        </div>
      )}

      {/* Main application area */}
      <div className="ops-main flex min-w-0 flex-1 flex-col">
        <header className="ops-header lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="ops-mobile-trigger"
              aria-label="Open Tour Manager navigation"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="ops-header-title">Tour Manager</div>
              <div className="ops-header-sub">Tour Operations</div>
            </div>
          </div>
        </header>

        <main className="ops-content flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TourManagerLayout;
