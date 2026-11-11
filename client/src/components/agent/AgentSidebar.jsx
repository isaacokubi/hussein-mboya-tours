/**
 * Purpose: Agent Sidebar reusable UI component. Main declarations: AgentSidebar.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { NavLink } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import {
  CalendarCheck,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Users,
  WalletCards,
  UserRound,
} from "lucide-react";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";

// Declare links for use by the surrounding module or function.
const links = [
  ["Dashboard", "/agent", LayoutDashboard],
  ["Bookings", "/agent/bookings", CalendarCheck],
  ["Customers", "/agent/customers", Users],
  ["Quotes", "/agent/quotes", MessageSquareQuote],
  ["Packages", "/agent/packages", Package],
  ["Commissions", "/agent/commission", WalletCards],
];

// Define AgentSidebar; its parameters and body implement this operation.
export default function AgentSidebar() {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};

  // Declare companyName for use by the surrounding module or function.
  const companyName =
    settings?.companyName || "Company";

  // Return the expression shown below to the caller.
  return (
    <div className="h-full w-72 overflow-y-auto bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand">
        <div className="ops-brand-mark">AG</div>
        <div>
          <div className="ops-brand-title">{companyName}</div>
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
      <NavLink to="/profile" className={({ isActive }) => `ops-link mt-2 ${isActive ? "active" : ""}`}><UserRound size={17} /><span>My Profile & Email</span></NavLink>
    </div>
  );
}
