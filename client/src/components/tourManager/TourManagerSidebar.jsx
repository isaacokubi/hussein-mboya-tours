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
          scrollbar-width: auto;
          scrollbar-color: #64748b #0f172a;
          scrollbar-gutter: stable;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-track {
          background: #0f172a;
          border-left: 1px solid rgba(148,163,184,.12);
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #64748b;
          border: 3px solid #0f172a;
          border-radius: 9999px;
          min-height: 48px;
        }
        .tour-manager-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
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
          className="tour-manager-sidebar-scroll ops-nav min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1"
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
