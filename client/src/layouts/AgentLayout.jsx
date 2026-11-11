/**
 * Purpose: Agent Layout client application module. Main declarations: AgentLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { Outlet, useLocation } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { Menu, X } from "lucide-react";
// Load ../components/agent/AgentSidebar so this module can use its exported dependencies.
import AgentSidebar from "../components/agent/AgentSidebar";
// Load ../components/common/DashboardLogoutButton so this module can use its exported dependencies.
import DashboardLogoutButton from "../components/common/DashboardLogoutButton";

// Define AgentLayout; its parameters and body implement this operation.
export default function AgentLayout() {
  // Declare [mobileOpen, setMobileOpen] for use by the surrounding module or function.
  const [mobileOpen, setMobileOpen] = useState(false);
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Return the expression shown below to the caller.
  return (
    <div className="dashboard-responsive agent-portal min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden lg:block"><AgentSidebar /></aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" aria-label="Close menu" />
          <aside className="relative h-full w-80 max-w-[85vw]"><AgentSidebar /><button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white" aria-label="Close agent menu"><X size={19} /></button></aside>
        </div>
      )}
      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-40 flex min-h-12 items-center justify-between gap-2 border-b border-indigo-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:min-h-14 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white shadow lg:hidden" aria-label="Open agent menu"><Menu size={20} /></button>
            <h1 className="truncate text-sm font-bold text-indigo-950 sm:text-base">Agent Portal</h1>
          </div>
          <DashboardLogoutButton />
        </header>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
