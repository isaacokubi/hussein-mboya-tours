/**
 * Purpose: Super Admin Layout client application module. Main declarations: SuperAdminLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { Outlet } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { Menu, Bell } from "lucide-react";
// Load ../components/superadmin/SuperAdminSidebar so this module can use its exported dependencies.
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";
// Load ../components/common/DashboardLogoutButton so this module can use its exported dependencies.
import DashboardLogoutButton from "../components/common/DashboardLogoutButton";

// Define SuperAdminLayout; its parameters and body implement this operation.
export default function SuperAdminLayout() {
  // Declare [open, setOpen] for use by the surrounding module or function.
  const [open, setOpen] = useState(false);
  // Return the expression shown below to the caller.
  return (
    <div className="dashboard-responsive min-h-screen bg-gray-100">
      <SuperAdminSidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 md:ml-72">
        <header className="flex min-h-14 items-center justify-between gap-3 bg-white px-3 py-2 shadow sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button className="shrink-0 rounded-lg p-1 md:hidden" onClick={() => setOpen(true)} aria-label="Open super admin menu"><Menu size={21} /></button>
            <div className="min-w-0"><h2 className="truncate text-sm font-bold sm:text-base">Super Admin Control Center</h2><p className="text-[10px] text-gray-500 sm:text-xs">Platform Governance</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Bell className="text-gray-600" size={19} />
            <DashboardLogoutButton />
          </div>
        </header>
        <main className="min-w-0 p-3 sm:p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
