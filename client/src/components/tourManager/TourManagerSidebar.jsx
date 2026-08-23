import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Car,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  MapPinned,
  PlusCircle,
  Settings,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "../../context/SettingsContext";

const links = [
  ["Dashboard", "/tour-manager", LayoutDashboard],
  ["Tours", "/tour-manager/tours", Map],
  ["Create Tour", "/tour-manager/create-tour", PlusCircle],
  ["Calendar", "/tour-manager/calendar", CalendarDays],
  ["Bookings", "/tour-manager/bookings", ClipboardList],
  ["Customers", "/tour-manager/customers", Users],
  ["Guides", "/tour-manager/guides", UserRoundCheck],
  ["Vehicles", "/tour-manager/vehicles", Car],
  ["Assignments", "/tour-manager/assignments", ClipboardCheck],
  ["Destinations", "/tour-manager/destinations", MapPinned],
  ["Itineraries", "/tour-manager/itineraries", FileText],
  ["Analytics", "/tour-manager/analytics", BarChart3],
  ["Reports", "/tour-manager/reports", BarChart3],
  ["Settings", "/tour-manager/settings", Settings],
];

export default function TourManagerSidebar() {
  const { companyName } = useSettings() || {};
  const navRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const update = () => {
      setShowScrollButton(nav.scrollHeight > nav.clientHeight + 8);
    };

    update();
    nav.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      nav.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToBottom = () => {
    navRef.current?.scrollTo({ top: navRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="relative flex h-full w-72 min-h-0 flex-col overflow-hidden bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand shrink-0">
        <div className="ops-brand-mark">TM</div>
        <div className="min-w-0">
          <div className="ops-brand-title truncate">{companyName || "Company"}</div>
          <div className="ops-brand-sub">Tour Operations</div>
        </div>
      </div>

      <div className="ops-section shrink-0">Daily Operations</div>

      <nav
        ref={navRef}
        className="ops-nav min-h-0 flex-1 overflow-y-auto pr-1 pb-14"
        aria-label="Tour Manager navigation"
      >
        {links.map(([name, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/tour-manager"}
            className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-slate-800/95 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Scroll sidebar to bottom"
          title="Scroll to bottom"
        >
          <ChevronDown size={15} aria-hidden="true" />
          <span>Scroll down</span>
        </button>
      )}
    </div>
  );
}
