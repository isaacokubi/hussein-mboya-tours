import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, Car, ClipboardCheck, ClipboardList, LayoutDashboard, Map, PlusCircle, UserRoundCheck, Users } from "lucide-react";
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
  ["Analytics", "/tour-manager/analytics", BarChart3],
  ["Reports", "/tour-manager/reports", BarChart3],
];

export default function TourManagerSidebar() {
  const { companyName } = useSettings() || {};
  return (
    <div className="h-full w-72 overflow-y-auto bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand">
        <div className="ops-brand-mark">TM</div>
        <div>
          <div className="ops-brand-title">{companyName || "Company"}</div>
          <div className="ops-brand-sub">Tour Operations</div>
        </div>
      </div>
      <div className="ops-section">Daily Operations</div>
      <nav className="ops-nav" aria-label="Tour Manager navigation">
        {links.map(([name, path, Icon]) => (
          <NavLink key={path} to={path} end={path === "/tour-manager"} className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}>
            <Icon size={17} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
