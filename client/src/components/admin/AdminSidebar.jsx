import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, CalendarCheck, Wallet, Users, Car, Settings, Smartphone, FileText, Home, Shield, BarChart3, UserRoundCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { isAdmin } from "../../utils/roleUtils";

const sections = [
  { title: "Operations", items: [["Dashboard", "/admin", LayoutDashboard, "admin.dashboard"], ["Bookings", "/admin/bookings", CalendarCheck, "booking.manage"], ["Tours", "/admin/manage-tours", Map, "tour.manage"], ["Customers", "/admin/customers", Users, "customer.view"], ["Guides", "/admin/guides", Users, "staff.manage"], ["Vehicles", "/admin/vehicles", Car, "staff.manage"], ["Custom Tour Requests", "/admin/custom-tour-requests", FileText, "customer.view"]] },
  { title: "Finance & Insight", items: [["Finance", "/admin/finance", Wallet, "finance.view"], ["M-Pesa Transactions", "/admin/finance/transactions", Smartphone, "finance.view"], ["Reports", "/admin/reports", FileText, "analytics.view"], ["Analytics", "/admin/analytics", BarChart3, "analytics.view"]] },
  { title: "Governance", items: [["Staff & Users", "/admin/staff", UserRoundCog, "staff.manage"], ["Roles & Permissions", "/admin/rbac", Shield, "roles.manage"], ["Settings", "/admin/settings", Settings, "settings.manage"], ["Website", "/", Home, null]] },
];

const ADMIN_CORE_PERMISSIONS = new Set(["admin.dashboard", "booking.manage", "tour.manage", "customer.view", "staff.manage", "finance.view", "analytics.view", "roles.manage", "settings.manage"]);

export default function AdminSidebar() {
  const { user, hasPermission } = useAuth();
  const { companyName } = useSettings() || {};
  const adminUser = isAdmin(user);
  const canRender = (permission) => !permission || (adminUser && ADMIN_CORE_PERMISSIONS.has(permission)) || hasPermission(permission);

  return <div>
    <div className="ops-brand"><div className="ops-brand-mark">CT</div><div><div className="ops-brand-title">{companyName || "Company"}</div><div className="ops-brand-sub">Operations Center</div></div></div>
    {sections.map(section => <div key={section.title}><div className="ops-section">{section.title}</div><nav className="ops-nav">{section.items.map(([name, path, Icon, permission]) => canRender(permission) ? <NavLink key={path} to={path} end={path === "/admin"} className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}><Icon size={17}/><span>{name}</span></NavLink> : null)}</nav></div>)}
    <div className="ops-alert" style={{marginTop:20}}>Operational mode: monitor bookings, payments, schedules and resources from one control surface.</div>
  </div>;
}
