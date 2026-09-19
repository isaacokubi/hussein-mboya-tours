import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, BarChart3, Bell, Bot, Car, CalendarCheck, CreditCard, FileBarChart, FileText, Handshake, Image, LayoutDashboard, Menu, PackageCheck, Plane, BriefcaseBusiness, BadgeDollarSign, Receipt, Settings, Shield, Smartphone, Star, Tag, UserCog, Users, Wallet, X, Code2, Hotel, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import api from "../api/axios";
import { getUserRole } from "../utils/roleUtils";

const MENU = [
  ["Dashboard", "/admin", LayoutDashboard, "admin.dashboard", "dashboard"],
  ["Users", "/admin/users", Users, "user.manage", "users"],
  ["Staff", "/admin/staff", UserCog, "staff.manage", "staff"],
  ["Destinations", "/admin/destinations", BriefcaseBusiness, "tour.manage", "destinations"],
  ["Bookings & Refunds", "/admin/bookings", CalendarCheck, "booking.manage", "bookings"],
  ["Custom Tour Requests", "/admin/custom-tour-requests", CalendarCheck, "booking.manage", "custom_tours"],
  ["Operations & Procurement", "/admin/operations", PackageCheck, "booking.manage", "operations"],
  ["Hotels", "/admin/hospitality?tab=hotels", Hotel, "booking.manage", "hotels"],
  ["Airport Transfers", "/admin/hospitality?tab=transfers", Plane, "booking.manage", "airport_transfers"],
  ["Hospitality Reservations", "/admin/hospitality?tab=bookings", CalendarCheck, "booking.manage", "hospitality_reservations"],
  ["Hospitality Operations", "/admin/hospitality/reservation-operations", BriefcaseBusiness, "booking.manage", "hospitality_operations"],
  ["Hospitality Commercial", "/admin/hospitality/commercial", BadgeDollarSign, "booking.manage", "hospitality_commercial"],
  ["Payments", "/admin/payments", CreditCard, "payment.manage", "payments"],
  ["Agents", "/admin/agents", Handshake, "user.manage", "agents"],
  ["Commissions", "/admin/commissions", Wallet, "finance.view", "commissions"],
  ["Customers CRM", "/admin/customers", Users, "manage_customers", "crm"],
  ["Fleet Management", "/admin/vehicles", Car, "staff.manage", "fleet"],
  ["Coupons", "/admin/coupons", Tag, "tour.manage", "coupons"],
  ["Reviews", "/admin/reviews", Star, "tour.manage", "reviews"],
  ["Gallery", "/admin/gallery", Image, "tour.manage", "gallery"],
  ["Reports", "/admin/reports", FileText, "analytics.view", "reports"],
  ["Analytics", "/admin/analytics", BarChart3, "analytics.view", "analytics"],
  ["Accounting & Finance", "/admin/finance", Wallet, "finance.view", "finance"],
  ["M-Pesa Transactions", "/admin/finance/transactions", Smartphone, "payment.manage", "mpesa_transactions"],
  ["Finance Reports", "/admin/finance/reports", FileBarChart, "finance.view", "finance_reports"],
  ["Management Accounting", "/admin/finance/management", FileBarChart, "finance.view", "management_accounting"],
  ["Complete Accounting", "/admin/finance/accounting/completion", FileBarChart, "finance.view", "complete_accounting"],
  ["Accounting Control Reports", "/admin/finance/accounting/control-reports", FileBarChart, "finance.view", "accounting_control_reports"],
  ["Accounting Subledgers", "/admin/finance/accounting/subledgers", FileBarChart, "finance.view", "accounting_subledgers"],
  ["Withholding Tax", "/admin/finance/withholding-tax", Receipt, "finance.view", "withholding_tax"],
  ["Reconciliation", "/admin/finance/reconciliation", Receipt, "finance.view", "reconciliation"],
  ["Compliance & eTIMS", "/admin/compliance", Shield, "finance.view", "etims"],
  ["AI Tools", "/admin/ai", Bot, "analytics.view", "ai"],
  ["Notifications", "/admin/notifications", Bell, "notifications.view", "notifications"],
  ["Roles & Permissions", "/admin/rbac", Shield, "roles.manage", "rbac"],
  ["System Health", "/admin/system-health", Activity, "admin.dashboard", "system_health"],
  ["Billing & Subscription", "/admin/billing", CreditCard, "settings.manage", "billing"],
  ["Developer Platform", "/admin/platform-architecture", Code2, "settings.manage", "developer_platform"],
  ["Settings", "/admin/settings", Settings, "settings.manage", "settings"],
];

const FINANCE_FEATURES = new Set([
  "reports", "analytics", "finance", "mpesa_transactions", "finance_reports", "management_accounting",
  "complete_accounting", "accounting_control_reports", "accounting_subledgers", "withholding_tax", "reconciliation", "etims"
]);

const INSIGHT_FEATURES = new Set(["reports", "analytics", "ai"]);

const GROUPS = [
  ["Operations", ["Dashboard", "Users", "Staff", "Destinations", "Bookings & Refunds", "Custom Tour Requests", "Operations & Procurement", "Hotels", "Airport Transfers", "Hospitality Reservations", "Hospitality Operations", "Hospitality Commercial", "Payments", "Agents", "Commissions", "Customers CRM", "Fleet Management", "Coupons", "Reviews", "Gallery"]],
  ["Finance & Insight", ["Reports", "Analytics", "Accounting & Finance", "M-Pesa Transactions", "Finance Reports", "Management Accounting", "Complete Accounting", "Accounting Control Reports", "Accounting Subledgers", "Withholding Tax", "Reconciliation", "Compliance & eTIMS", "AI Tools"]],
  ["Governance", ["Notifications", "Roles & Permissions", "System Health", "Billing & Subscription", "Developer Platform", "Settings"]],
];

export default function AdminLayout() {
  const { user, hasPermission } = useAuth();
  const { companyName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [planFeatures, setPlanFeatures] = useState(null);
  const [plan, setPlan] = useState("");
  const location = useLocation();
  const role = getUserRole(user);
  const isAdministrator = ["admin", "administrator", "super_admin"].includes(String(role || "").toLowerCase());

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isAdministrator) return undefined;
    let active = true;
    api.get("/subscription").then(({ data }) => {
      if (!active) return;
      setPlan(String(data?.plan || "").toLowerCase());
      setPlanFeatures(Array.isArray(data?.features) ? data.features : null);
    }).catch(() => { if (active) setPlanFeatures(null); });
    return () => { active = false; };
  }, [isAdministrator]);

  const links = useMemo(() => {
    const permissionLinks = MENU.filter(([, , , permission]) => hasPermission(permission));
    if (!planFeatures) return permissionLinks;

    // Finance and business intelligence are core administrator capabilities.
    // Do not let a stale/incomplete subscription feature list make these menus disappear.
    return permissionLinks.filter(([, , , , feature]) => {
      if (isAdministrator && (FINANCE_FEATURES.has(feature) || INSIGHT_FEATURES.has(feature))) return true;
      return !feature || planFeatures.includes(feature);
    });
  }, [hasPermission, planFeatures, isAdministrator]);

  const groupedLinks = useMemo(() => {
    const byName = new Map(links.map(link => [link[0], link]));
    return GROUPS.map(([title, names]) => ({
      title,
      links: names.map(name => byName.get(name)).filter(Boolean),
    })).filter(group => group.links.length > 0);
  }, [links]);

  return (
    <div className="dashboard-responsive admin-portal min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-y-auto bg-slate-950 text-white lg:block">
        <SidebarContent companyName={companyName} user={user} groups={groupedLinks} plan={plan} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button aria-label="Close admin menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="relative h-full w-80 max-w-[85vw] overflow-y-auto bg-slate-950 text-white shadow-2xl">
            <SidebarContent companyName={companyName} user={user} groups={groupedLinks} plan={plan} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close menu"><X size={20} /></button>
          </aside>
        </div>
      )}
      <div className="min-h-screen lg:pl-72">
        <header className="admin-portal-header sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur sm:px-4 sm:py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setMobileOpen(true)} className="shrink-0 rounded-xl bg-indigo-700 p-2 text-white shadow lg:hidden" aria-label="Open admin menu"><Menu size={21} /></button><NavLink to="/admin" end aria-label="Go to dashboard" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"><Home size={16} /><span>Dashboard</span></NavLink>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-indigo-700 sm:text-xs">Administration</p><h1 className="truncate text-sm font-bold text-slate-900 sm:text-base lg:text-lg">{companyName} Control Center</h1></div>
          </div>
          <div className="hidden max-w-[35%] text-right sm:block"><p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Administrator"}</p><p className="text-[10px] capitalize text-slate-500 sm:text-xs">{String(role || "admin").replace(/_/g, " ")}{plan ? ` · ${plan}` : ""}</p></div>
        </header>
        <main className="admin-portal-main min-w-0 p-3 sm:p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

function SidebarContent({ companyName, user, groups, plan }) {
  return (
    <div className="admin-sidebar-content p-4 sm:p-5">
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-violet-500/20 p-3 ring-1 ring-white/10 sm:mb-6 sm:p-4">
        <div className="truncate text-lg font-black tracking-tight sm:text-xl">{companyName}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300 sm:text-xs">Admin Control Center</div>
        <div className="mt-3 truncate text-xs text-slate-300 sm:mt-4 sm:text-sm">{user?.name || "Administrator"}</div>
        {plan && <div className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300">{plan} plan</div>}
      </div>
      <nav className="space-y-4" aria-label="Admin navigation">
        {groups.map((group, index) => (
          <section key={group.title} aria-labelledby={`admin-nav-${index}`}>
            <div id={`admin-nav-${index}`} className="mb-2 flex items-center gap-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <span className="h-0.5 w-5 rounded-full bg-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">{group.title}</span>
            </div>
            <div className="space-y-1">
              {group.links.map(([name, path, Icon]) => (
                <NavLink key={path} to={path} end={path === "/admin"} className={({ isActive }) => `admin-sidebar-link flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm ${isActive ? "active" : ""}`}>
                  <Icon size={17} className="shrink-0" />
                  <span className="truncate">{name}</span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
      <NavLink to="/profile" className={({ isActive }) => `mt-5 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-500 text-slate-950" : "text-slate-200 hover:bg-white/10"}`}>
        <UserCog size={17} />
        <span>My Profile & Email</span>
      </NavLink>
    </div>
  );
}
