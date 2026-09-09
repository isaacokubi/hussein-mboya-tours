import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, CalendarCheck, Wallet, Users, Car, Settings, Smartphone, FileText, Home, Shield, BarChart3, UserRoundCog, PackageCheck, Receipt, BookOpen, Code2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { isAdmin } from "../../utils/roleUtils";

const sections = [
  { title: "Operations", items: [["Dashboard", "/admin", LayoutDashboard, "admin.dashboard"], ["Bookings", "/admin/bookings", CalendarCheck, "booking.manage"], ["Operations & Procurement", "/admin/operations", PackageCheck, "booking.manage"], ["Tours", "/admin/manage-tours", Map, "tour.manage"], ["Customers", "/admin/customers", Users, "customer.view"], ["Reviews", "/admin/reviews", FileText, "customer.view"], ["Coupons", "/admin/coupons", FileText, "tour.manage"], ["Agents", "/admin/agents", Users, "agent.manage"], ["Guides", "/admin/guides", Users, "staff.manage"], ["Vehicles", "/admin/vehicles", Car, "staff.manage"], ["Custom Tour Requests", "/admin/custom-tour-requests", FileText, "customer.view"]] },
  { title: "Finance & Insight", items: [["Accounting & Finance", "/admin/finance", Wallet, "finance.view"], ["General Ledger", "/admin/finance#general-ledger", BookOpen, "finance.view"], ["M-Pesa Transactions", "/admin/finance/transactions", Smartphone, "finance.view"], ["Finance Reports", "/admin/finance/reports", FileText, "finance.view"], ["Reconciliation", "/admin/finance/reconciliation", Receipt, "finance.view"], ["Reports", "/admin/reports", FileText, "analytics.view"], ["Analytics", "/admin/analytics", BarChart3, "analytics.view"]] },
  { title: "Governance", items: [["Compliance & eTIMS", "/admin/compliance", Shield, "finance.view"], ["Platform Controls", "/admin/platform-architecture", Code2, "settings.manage"], ["Staff & Users", "/admin/staff", UserRoundCog, "staff.manage"], ["Roles & Permissions", "/admin/rbac", Shield, "roles.manage"], ["Settings", "/admin/settings", Settings, "settings.manage"], ["Website", "/", Home, null]] },
];

const ADMIN_CORE_PERMISSIONS = new Set(["admin.dashboard", "booking.manage", "tour.manage", "customer.view", "staff.manage", "agent.manage", "finance.view", "analytics.view", "roles.manage", "settings.manage"]);

export default function AdminSidebar() {
  const { user, hasPermission } = useAuth();
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || "Company";
  const adminUser = isAdmin(user);
  const canRender = (permission) => { if (!permission) return true; return (adminUser && ADMIN_CORE_PERMISSIONS.has(permission)) || hasPermission(permission); };
  return <div><div className="ops-brand"><div className="ops-brand-mark">CT</div><div><div className="ops-brand-title">{companyName}</div><div className="ops-brand-sub">Operations Center</div></div></div>{sections.map((section) => <div key={section.title}><div className="ops-section">{section.title}</div><nav className="ops-nav">{section.items.map(([name, path, Icon, permission]) => canRender(permission) ? <NavLink key={path + name} to={path} className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}><Icon size={17}/><span>{name}</span></NavLink> : null)}</nav></div>)}<div className="ops-alert" style={{ marginTop: 20 }}>Operational mode: monitor bookings, payments, schedules, resources, procurement, accounting, compliance, privacy governance and integrations from one control surface.</div></div>;
}
