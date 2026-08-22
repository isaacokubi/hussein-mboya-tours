import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
        <AdminHeader onMenu={() => setOpen(true)} />
        <main className="ops-content" key={location.pathname}><Outlet /></main>
      </div>
    </div>
  );
}
