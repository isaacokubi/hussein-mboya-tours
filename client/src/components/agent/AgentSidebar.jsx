import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Users, WalletCards, MessageSquareQuote } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const links = [
  ["Dashboard", "/agent", LayoutDashboard],
  ["Bookings", "/agent/bookings", CalendarCheck],
  ["Customers", "/agent/customers", Users],
  ["Quotes", "/agent/quotes", MessageSquareQuote],
  ["Commissions", "/agent/commission", WalletCards],
];

export default function AgentSidebar() {
  const { companyName } = useSettings();

  return (
    <aside className="min-h-screen w-72 bg-slate-950 p-5 text-white">
      <div className="mb-8 rounded-2xl bg-emerald-700/20 p-4 ring-1 ring-emerald-500/20">
        <h2 className="text-xl font-black">{companyName}</h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Agent Portal</p>
      </div>
      <nav className="space-y-1.5">
        {links.map(([name, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/agent"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
