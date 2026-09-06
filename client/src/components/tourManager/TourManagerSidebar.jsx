import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Car,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  MapPinned,
  PlusCircle,
  UserRoundCheck,
  Users,
} from "lucide-react";
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
];

export default function TourManagerSidebar() {
  const { companyName } = useSettings() || {};

  return (
    <>
      <style>{`
        .tour-manager-sidebar-scroll {
          overflow-y: scroll !important;
          scrollbar-width: auto;
          scrollbar-color: #94a3b8 #020617;
          scrollbar-gutter: stable;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar {
          width: 14px;
          display: block;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-track {
          background: #020617;
          border-left: 1px solid rgba(255,255,255,.18);
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border: 3px solid #020617;
          border-radius: 9999px;
          min-height: 52px;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>

      <div className="flex h-full min-h-0 w-72 flex-col overflow-hidden bg-slate-950 px-5 py-6 text-white">
        <div className="ops-brand shrink-0">
          <div className="ops-brand-mark">TM</div>
          <div className="min-w-0">
            <div className="ops-brand-title truncate">{companyName || "Company"}</div>
            <div className="ops-brand-sub">Tour Operations</div>
          </div>
        </div>

        <div className="ops-section shrink-0">Daily Operations</div>

        <nav
          className="tour-manager-sidebar-scroll ops-nav min-h-0 flex-1 overflow-x-hidden pr-1"
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
      </div>
    </>
  );
}
