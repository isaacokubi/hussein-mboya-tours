/**
 * Purpose: Admin Layout reusable UI component. Main declarations: AdminLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { NavLink, Outlet, useLocation } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { X, LayoutDashboard } from "lucide-react";
// Load ../../components/admin/AdminSidebar so this module can use its exported dependencies.
import AdminSidebar from "../../components/admin/AdminSidebar";
// Load ../../components/admin/AdminHeader so this module can use its exported dependencies.
import AdminHeader from "../../components/admin/AdminHeader";

// Define AdminLayout; its parameters and body implement this operation.
export default function AdminLayout() {
  // Declare [open, setOpen] for use by the surrounding module or function.
  const [open, setOpen] = useState(false);
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Return the expression shown below to the caller.
  return (
    <div className="ops-shell">
      <div className={`ops-drawer ${open ? "open" : ""}`}>
        <button className="ops-drawer-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />
        <aside className="ops-drawer-panel">
          <div style={{position:"relative"}}><AdminSidebar /></div>
          <button onClick={() => setOpen(false)} aria-label="Close menu" style={{position:"absolute",top:12,right:12}}><X /></button>
        </aside>
      </div>
      <aside className="ops-sidebar"><AdminSidebar /></aside>
      <div className="ops-main">
        <div className="lg:hidden flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2"><NavLink to="/admin" end className={({isActive}) => `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${isActive ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700"}`}><LayoutDashboard size={16} />Dashboard</NavLink></div><AdminHeader onMenu={() => setOpen(true)} />
        <main className="ops-content" key={location.pathname}><Outlet /></main>
      </div>
    </div>
  );
}
