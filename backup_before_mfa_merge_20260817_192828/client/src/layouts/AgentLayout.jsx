import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AgentSidebar from "../components/agent/AgentSidebar";

export default function AgentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden lg:block">
        <AgentSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" aria-label="Close menu" />
          <aside className="relative h-full w-80 max-w-[85vw]">
            <AgentSidebar />
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close agent menu"><X size={20} /></button>
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex min-h-14 items-center gap-3 border-b bg-white px-4 py-3 shadow-sm lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-xl bg-slate-900 p-2 text-white" aria-label="Open agent menu"><Menu size={22} /></button>
          <h1 className="font-bold">Agent Portal</h1>
        </header>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
