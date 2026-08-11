import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard, CalendarCheck, UserRound, Heart,   FileText, } from "lucide-react";

const NAV = {
  customer: [
    ["/dashboard","Dashboard",LayoutDashboard],["/my-bookings","My Bookings",CalendarCheck],
    ["/tours","Explore Tours",FileText],["/profile","Profile",UserRound],["/wishlist","Wishlist",Heart],
  ],
  guide: [
    ["/guide/dashboard","Dashboard",LayoutDashboard],["/my-bookings","Bookings",CalendarCheck],["/profile","Profile",UserRound],
  ],
  driver: [
    ["/driver/dashboard","Dashboard",LayoutDashboard],["/my-bookings","Bookings",CalendarCheck],["/profile","Profile",UserRound],
  ],
};

export default function MobileDashboardNav({ role = "customer", title = "Coherent Tours" }) {
  const [open, setOpen] = useState(false);
  const items = NAV[role] || NAV.customer;
  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open dashboard menu" className="rounded-xl bg-slate-900 p-2 text-white"><Menu size={21}/></button>
        <span className="font-bold text-slate-900">{title}</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button aria-label="Close dashboard menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60"/>
          <aside className="relative h-full w-80 max-w-[86vw] bg-slate-950 p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between"><div><div className="text-lg font-bold">Coherent Tours</div><div className="text-xs text-slate-400 capitalize">{role} portal</div></div><button onClick={()=>setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-white/10"><X size={20}/></button></div>
            <nav className="space-y-2">{items.map(([to,label,Icon])=><Link key={to} to={to} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium hover:bg-white/10"><Icon size={19}/>{label}</Link>)}</nav>
          </aside>
        </div>
      )}
    </>
  );
}
