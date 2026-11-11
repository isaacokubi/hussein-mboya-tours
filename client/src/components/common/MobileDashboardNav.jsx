/**
 * Purpose: Mobile Dashboard Nav reusable UI component. Main declarations: MobileDashboardNav.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load react so this module can use its exported dependencies.
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { Menu, X, LayoutDashboard, CalendarCheck, UserRound, Heart, FileText, Sparkles } from "lucide-react";
// Load ./DashboardLogoutButton so this module can use its exported dependencies.
import DashboardLogoutButton from "./DashboardLogoutButton";

// Declare NAV for use by the surrounding module or function.
const NAV = {
  customer: [["/dashboard", "Dashboard", LayoutDashboard], ["/my-bookings", "My Bookings", CalendarCheck], ["/custom-tour", "Custom Tour", Sparkles], ["/tours", "Explore Tours", FileText], ["/profile", "Profile", UserRound], ["/wishlist", "Wishlist", Heart]],
  guide: [["/guide/dashboard", "Dashboard", LayoutDashboard], ["/guide/assigned-tours", "Assigned Tours", CalendarCheck], ["/profile", "Profile", UserRound]],
  driver: [["/driver/dashboard", "Dashboard", LayoutDashboard], ["/profile", "Profile & Email", UserRound]],
};

// Define MobileDashboardNav; its parameters and body implement this operation.
export default function MobileDashboardNav({ role = "customer", title }) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare displayTitle for use by the surrounding module or function.
  const displayTitle = title || settings.companyName || "Company";
  // Declare [open, setOpen] for use by the surrounding module or function.
  const [open, setOpen] = useState(false);
  // Declare items for use by the surrounding module or function.
  const items = NAV[role] || NAV.customer;
  // Return the expression shown below to the caller.
  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-indigo-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open dashboard menu" className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white shadow"><Menu size={21} /></button>
          <span className="truncate font-bold text-indigo-950">{displayTitle}</span>
        </div>
        <DashboardLogoutButton />
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button aria-label="Close dashboard menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/70" />
          <aside className="relative h-full w-80 max-w-[86vw] bg-gradient-to-b from-slate-950 via-indigo-950 to-violet-950 p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div><div className="text-lg font-black">{displayTitle}</div><div className="text-xs font-semibold uppercase tracking-wider text-sky-300">{role} portal</div></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-white/10"><X size={20} /></button>
            </div>
            <nav className="space-y-2">
              {items.map(([to, label, Icon]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"><Icon size={19} />{label}</Link>)}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
