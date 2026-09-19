import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { X, LayoutDashboard } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
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
