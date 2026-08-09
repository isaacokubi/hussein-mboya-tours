import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Map, CalendarDays, ClipboardList, Users,
  UserRoundCheck, BarChart3, Car, ClipboardCheck
} from "lucide-react";

export default function TourManagerSidebar() {
  const links = [
    ["Dashboard", "/tour-manager", LayoutDashboard],
    ["Tours", "/tour-manager/tours", Map],
    ["Calendar", "/tour-manager/calendar", CalendarDays],
    ["Bookings", "/tour-manager/bookings", ClipboardList],
    ["Customers", "/tour-manager/customers", Users],
    ["Guides", "/tour-manager/guides", UserRoundCheck],
    ["Vehicles", "/tour-manager/vehicles", Car],
    ["Assignments", "/tour-manager/assignments", ClipboardCheck],
    ["Analytics", "/tour-manager/analytics", BarChart3],
    ["Reports", "/tour-manager/reports", BarChart3],
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5 overflow-y-auto">
      <h2 className="text-xl font-bold mb-8">Tour Manager</h2>
      <nav className="space-y-2">
        {links.map(([name, path, Icon]) => (
          <NavLink key={path} to={path} end={path === "/tour-manager"}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? "bg-blue-600" : "hover:bg-gray-800"}`}>
            <Icon size={20} /><span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
