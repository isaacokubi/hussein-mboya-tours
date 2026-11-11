/**
 * Purpose: Tour Manager Sidebar reusable UI component. Main declarations: TourManagerSidebar, update, scrollToBottom.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { NavLink } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import {
  CalendarDays,
  Bot,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  PlusCircle,
  UserRoundCheck,
  UserRound,
} from "lucide-react";
// Load react so this module can use its exported dependencies.
import { useEffect, useRef, useState } from "react";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";

// Tour Manager owns day-to-day tour operations. Enterprise administration,
// CRM, fleet master data, destinations, analytics and reporting stay in Admin.
// Declare links for use by the surrounding module or function.
const links = [
  ["Dashboard", "/tour-manager", LayoutDashboard],
  ["Operations Copilot", "/tour-manager/copilot", Bot],
  ["Tours", "/tour-manager/tours", Map],
  ["Create Tour", "/tour-manager/create-tour", PlusCircle],
  ["Calendar", "/tour-manager/calendar", CalendarDays],
  ["Bookings", "/tour-manager/bookings", ClipboardList],
  ["Guides", "/tour-manager/guides", UserRoundCheck],
  ["Assignments", "/tour-manager/assignments", ClipboardCheck],
  ["Itineraries", "/tour-manager/itineraries", FileText],
];

// Define TourManagerSidebar; its parameters and body implement this operation.
export default function TourManagerSidebar() {
  // Declare { companyName } for use by the surrounding module or function.
  const { companyName } = useSettings() || {};
  // Declare navRef for use by the surrounding module or function.
  const navRef = useRef(null);
  // Declare [showScrollButton, setShowScrollButton] for use by the surrounding module or function.
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare nav for use by the surrounding module or function.
    const nav = navRef.current;
    // Check the condition (!nav) and run the matching branch.
    if (!nav) return undefined;
    // Declare update for use by the surrounding module or function.
    const update = () => setShowScrollButton(nav.scrollHeight > nav.clientHeight + 8);
    // Perform the side effect or state update expressed on the following line.
    update();
    // Perform the side effect or state update expressed on the following line.
    nav.addEventListener("scroll", update, { passive: true });
    // Perform the side effect or state update expressed on the following line.
    window.addEventListener("resize", update);
    // Return the expression shown below to the caller.
    return () => {
      // Perform the side effect or state update expressed on the following line.
      nav.removeEventListener("scroll", update);
      // Perform the side effect or state update expressed on the following line.
      window.removeEventListener("resize", update);
    };
  }, []);

  // Declare scrollToBottom for use by the surrounding module or function.
  const scrollToBottom = () => {
    // Perform the side effect or state update expressed on the following line.
    navRef.current?.scrollTo({ top: navRef.current.scrollHeight, behavior: "smooth" });
  };

  // Return the expression shown below to the caller.
  return (
    <div className="relative flex h-full w-72 min-h-0 flex-col overflow-hidden bg-slate-950 px-5 py-6 text-white">
      <div className="ops-brand shrink-0">
        <div className="ops-brand-mark">TM</div>
        <div className="min-w-0">
          <div className="ops-brand-title truncate">{companyName || "Company"}</div>
          <div className="ops-brand-sub">Tour Operations</div>
        </div>
      </div>
      <div className="ops-section shrink-0">Daily Operations</div>
      <nav ref={navRef} className="ops-nav min-h-0 flex-1 overflow-y-auto pr-1 pb-14" aria-label="Tour Manager navigation">
        {links.map(([name, path, Icon]) => (
          <NavLink key={path} to={path} end={path === "/tour-manager"} className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}>
            <Icon size={17} aria-hidden="true" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/profile" end className={({ isActive }) => `ops-link shrink-0 ${isActive ? "active" : ""}`}><UserRound size={17} aria-hidden="true" /><span>My Profile & Email</span></NavLink>
      {showScrollButton && (
        <button type="button" onClick={scrollToBottom} className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-slate-800/95 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Scroll sidebar to bottom" title="Scroll to bottom">
          <ChevronDown size={15} aria-hidden="true" />
          <span>Scroll down</span>
        </button>
      )}
    </div>
  );
}
