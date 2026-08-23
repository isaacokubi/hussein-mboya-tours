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
  Settings,
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
  ["Settings", "/tour-manager/settings", Settings],
];

export default function TourManagerSidebar() {
  const { companyName } = useSettings() || {};

  return (
    <div className="flex h-full w-72 flex-col overflow-y-auto bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand">
        <div className="ops-brand-mark">TM</div>
        <div className="min-w-0">
          <div className="ops-brand-title truncate">{companyName || "Company"}</div>
          <div className="ops-brand-sub">Tour Operations</div>
        </div>
      </div>

      <div className="ops-section">Daily Operations</div>

      <nav className="ops-nav" aria-label="Tour Manager navigation">
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
  );
}
