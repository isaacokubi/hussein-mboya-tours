import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Users,
  WalletCards,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const links = [
  ["Dashboard", "/agent", LayoutDashboard],
  ["Bookings", "/agent/bookings", CalendarCheck],
  ["Customers", "/agent/customers", Users],
  ["Quotes", "/agent/quotes", MessageSquareQuote],
  ["Packages", "/agent/packages", Package],
  ["Commissions", "/agent/commission", WalletCards],
];

export default function AgentSidebar() {
  const { companyName } = useSettings();

  return (
    <div className="h-full w-72 overflow-y-auto bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand">
        <div className="ops-brand-mark">AG</div>
        <div>
          <div className="ops-brand-title">{companyName || "COHERENT TOURS"}</div>
          <div className="ops-brand-sub">Sales Operations</div>
        </div>
      </div>
      <div className="ops-section">Agent Workspace</div>
      <nav className="ops-nav" aria-label="Agent navigation">
        {links.map(([name, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/agent"}
            className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}
          >
            <Icon size={17} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
