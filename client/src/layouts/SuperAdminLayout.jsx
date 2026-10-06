import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, LogOut } from "lucide-react";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";
import { useAuth } from "../context/AuthContext";

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  return (
    <div className="dashboard-responsive min-h-screen bg-gray-100">
      <SuperAdminSidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 md:ml-72">
        <header className="flex min-h-14 items-center justify-between gap-3 bg-white px-3 py-2 shadow sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button className="shrink-0 rounded-lg p-1 md:hidden" onClick={() => setOpen(true)} aria-label="Open super admin menu"><Menu size={21} /></button>
            <div className="min-w-0"><h2 className="truncate text-sm font-bold sm:text-base">Super Admin Control Center</h2><p className="text-[10px] text-gray-500 sm:text-xs">Platform Governance</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Bell className="text-gray-600" size={19} />
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" aria-label="Logout">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="min-w-0 p-3 sm:p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
