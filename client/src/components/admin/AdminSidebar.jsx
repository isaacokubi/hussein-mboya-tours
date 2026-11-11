/**
 * Purpose: Admin Sidebar reusable UI component. Main declarations: AdminSidebar, canRender.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { NavLink } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { LayoutDashboard, Map, CalendarCheck, Wallet, Users, Car, Settings, Smartphone, FileText, Home, Shield, BarChart3, UserRoundCog, PackageCheck, Receipt, BookOpen, Code2, Hotel, Plane, BrainCircuit } from "lucide-react";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { isAdmin } from "../../utils/roleUtils";

// Declare sections for use by the surrounding module or function.
const sections = [
  { title: "Operations", items: [["Dashboard","/admin",LayoutDashboard,"admin.dashboard"],["Bookings","/admin/bookings",CalendarCheck,"booking.manage"],["Operations & Procurement","/admin/operations",PackageCheck,"booking.manage"],["Hotels","/admin/hospitality?tab=hotels",Hotel,"booking.manage"],["Airport Transfers","/admin/hospitality?tab=transfers",Plane,"booking.manage"],["Hospitality Reservations","/admin/hospitality?tab=bookings",CalendarCheck,"booking.manage"],["Tours","/admin/manage-tours",Map,"tour.manage"],["Customers","/admin/customers",Users,"customer.view"],["Reviews","/admin/reviews",FileText,"customer.view"],["Coupons","/admin/coupons",FileText,"tour.manage"],["Agents","/admin/agents",Users,"agent.manage"],["Guides","/admin/guides",Users,"staff.manage"],["Vehicles","/admin/vehicles",Car,"staff.manage"],["Custom Tour Requests","/admin/custom-tour-requests",FileText,"customer.view"]]},
  { title: "Finance & Insight", items: [["Accounting & Finance","/admin/finance",Wallet,"finance.view"],["General Ledger","/admin/finance#general-ledger",BookOpen,"finance.view"],["M-Pesa Transactions","/admin/finance/transactions",Smartphone,"finance.view"],["Finance Reports","/admin/finance/reports",FileText,"finance.view"],["Reconciliation","/admin/finance/reconciliation",Receipt,"finance.view"],["Reports","/admin/reports",FileText,"analytics.view"],["Analytics","/admin/analytics",BarChart3,"analytics.view"],["AI Control Center","/admin/ai",BrainCircuit,"analytics.view"]]},
  { title: "Governance", items: [["Compliance & eTIMS","/admin/compliance",Shield,"finance.view"],["Platform Controls","/admin/platform-architecture",Code2,"settings.manage"],["Staff & Users","/admin/staff",UserRoundCog,"staff.manage"],["Roles & Permissions","/admin/rbac",Shield,"roles.manage"],["Settings","/admin/settings",Settings,"settings.manage"],["Website","/",Home,null]]}
];

// Declare ADMIN_CORE_PERMISSIONS for use by the surrounding module or function.
const ADMIN_CORE_PERMISSIONS = new Set(["admin.dashboard","booking.manage","tour.manage","customer.view","staff.manage","agent.manage","finance.view","analytics.view","roles.manage","settings.manage"]);

// Define AdminSidebar; its parameters and body implement this operation.
export default function AdminSidebar() {
  // Declare { user, hasPermission } for use by the surrounding module or function.
  const { user, hasPermission } = useAuth();
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings?.companyName || "Company";
  // Declare adminUser for use by the surrounding module or function.
  const adminUser = isAdmin(user);
  // Declare canRender for use by the surrounding module or function.
  const canRender = (permission) => !permission || (adminUser && ADMIN_CORE_PERMISSIONS.has(permission)) || hasPermission(permission);

  // Return the expression shown below to the caller.
  return (
    <div className="admin-sidebar-navigation" style={{ paddingBottom: 24 }}>
      <div className="ops-brand">
        <div className="ops-brand-mark">AT</div>
        <div>
          <div className="ops-brand-title">{companyName}</div>
          <div className="ops-brand-sub">Operations Center</div>
        </div>
      </div>

      {sections.map((section, sectionIndex) => (
        <section
          key={section.title}
          aria-labelledby={`admin-sidebar-section-${sectionIndex}`}
          style={{ marginTop: sectionIndex === 0 ? 2 : 18 }}
        >
          <div
            id={`admin-sidebar-section-${sectionIndex}`}
            className="ops-section"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "0 8px 8px",
              padding: "9px 8px 7px",
              color: "#e5c98f",
              fontSize: 10,
              fontWeight: 900,
              lineHeight: 1.2,
              textTransform: "uppercase",
              letterSpacing: ".15em",
              borderTop: sectionIndex === 0 ? "none" : "1px solid rgba(197,157,95,.28)",
            }}
          >
            <span aria-hidden="true" style={{ width: 18, height: 2, borderRadius: 999, background: "#c59d5f", opacity: .9 }} />
            <span>{section.title}</span>
          </div>
          <nav className="ops-nav" aria-label={`${section.title} navigation`}>
            {section.items.map(([name, path, Icon, permission]) =>
              canRender(permission) ? (
                <NavLink
                  key={path + name}
                  to={path}
                  className={({ isActive }) => `ops-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={17} />
                  <span>{name}</span>
                </NavLink>
              ) : null
            )}
          </nav>
        </section>
      ))}

      <div className="ops-alert" style={{ marginTop: 20 }}>
        Operational mode: manage bookings, hotels, room inventory, airport transfers, schedules, resources, procurement, accounting, compliance, AI intelligence and integrations from one control surface.
      </div>
    </div>
  );
}
