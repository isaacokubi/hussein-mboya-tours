import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, BarChart3, Bell, Bot, Car, CalendarCheck, CreditCard, FileText, Handshake, Image, LayoutDashboard, Map, Menu, PlusCircle, Settings, Shield, Smartphone, Star, Tag, UserCog, Users, Wallet, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { getUserRole } from "../utils/roleUtils";
import TenantBilling from "../pages/admin/TenantBilling";

const MENU = [
  ["Dashboard", "/admin", LayoutDashboard, "admin.dashboard"], ["Users", "/admin/users", Users, "user.manage"], ["Staff", "/admin/staff", UserCog, "staff.manage"], ["Tours", "/admin/manage-tours", Map, "tour.manage"], ["Add Tour", "/admin/tours/add", PlusCircle, "tour.manage"], ["Destinations", "/admin/destinations", Map, "tour.manage"], ["Bookings", "/admin/bookings", CalendarCheck, "booking.manage"], ["Custom Tour Requests", "/admin/custom-tour-requests", CalendarCheck, "booking.manage"], ["Payments", "/admin/payments", CreditCard, "payment.manage"], ["Agents", "/admin/agents", Handshake, "user.manage"], ["Commissions", "/admin/commissions", Wallet, "finance.view"], ["Customers CRM", "/admin/customers", Users, "manage_customers"], ["Guides", "/admin/guides", UserCog, "staff.manage"], ["Vehicles", "/admin/vehicles", Car, "staff.manage"], ["Coupons", "/admin/coupons", Tag, "tour.manage"], ["Reviews", "/admin/reviews", Star, "tour.manage"], ["Gallery", "/admin/gallery", Image, "tour.manage"], ["Reports", "/admin/reports", FileText, "analytics.view"], ["Analytics", "/admin/analytics", BarChart3, "analytics.view"], ["Finance", "/admin/finance", Wallet, "finance.view"], ["M-Pesa Transactions", "/admin/finance/transactions", Smartphone, "payment.manage"], ["Finance Reports", "/admin/finance/reports", FileText, "finance.view"], ["Reconciliation", "/admin/finance/reconciliation", CreditCard, "finance.view"], ["AI Tools", "/admin/ai", Bot, "analytics.view"], ["Notifications", "/admin/notifications", Bell, "notifications.view"], ["Roles & Permissions", "/admin/rbac", Shield, "roles.manage"], ["System Health", "/admin/system-health", Activity, "admin.dashboard"], ["Billing & Subscription", "/admin/billing", CreditCard, "settings.manage"], ["Settings", "/admin/settings", Settings, "settings.manage"],
];

export default function AdminLayout() {
  const { user, hasPermission } = useAuth();
  const { companyName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const role = getUserRole(user);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  const links = useMemo(() => {
    if (["admin", "super_admin"].includes(role)) return MENU;
    return MENU.filter(([, , , permission]) => hasPermission(permission));
  }, [role, hasPermission]);

  const isBillingRoute = ["/admin/billing", "/admin/subscriptions", "/admin/subscription", "/admin/billing/subscription"].includes(location.pathname);

  return (
    <div className="dashboard-responsive min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-y-auto bg-slate-950 text-white lg:block">
        <SidebarContent companyName={companyName} user={user} links={links} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button aria-label="Close admin menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="relative h-full w-80 max-w-[85vw] overflow-y-auto bg-slate-950 text-white shadow-2xl">
            <SidebarContent companyName={companyName} user={user} links={links} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close menu"><X size={20} /></button>
          </aside>
        </div>
      )}
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur sm:px-4 sm:py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setMobileOpen(true)} className="shrink-0 rounded-xl bg-slate-900 p-2 text-white lg:hidden" aria-label="Open admin menu"><Menu size={21} /></button>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-700 sm:text-xs">Administration</p><h1 className="truncate text-sm font-bold text-slate-900 sm:text-base lg:text-lg">{companyName} Control Center</h1></div>
          </div>
          <div className="hidden max-w-[35%] text-right sm:block"><p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Administrator"}</p><p className="text-[10px] capitalize text-slate-500 sm:text-xs">{String(role || "admin").replace(/_/g, " ")}</p></div>
        </header>
        <main className="min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">
          {isBillingRoute ? <TenantBilling /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ companyName, user, links }) {
  return <div className="p-4 sm:p-5"><div className="mb-6 rounded-2xl bg-emerald-700/20 p-3 ring-1 ring-emerald-500/20 sm:mb-8 sm:p-4"><div className="truncate text-lg font-black tracking-tight sm:text-xl">{companyName}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-xs">Admin Control Center</div><div className="mt-3 truncate text-xs text-slate-300 sm:mt-4 sm:text-sm">{user?.name || "Administrator"}</div></div><nav className="space-y-1">{links.map(([name, path, Icon]) => <NavLink key={path} to={path} end={path === "/admin"} className={({ isActive }) => `flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm ${isActive ? "bg-emerald-600 text-white shadow" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={17} className="shrink-0" /><span className="truncate">{name}</span></NavLink>)}</nav></div>;
}
