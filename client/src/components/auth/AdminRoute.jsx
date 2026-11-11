/**
 * Purpose: Admin Route reusable UI component. Main declarations: AdminRoute.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole, isAdmin } from "../../utils/roleUtils";

// Declare MANAGER_CONTENT_PATHS for use by the surrounding module or function.
const MANAGER_CONTENT_PATHS = ["/admin/gallery"];
// Declare PLATFORM_ROLES for use by the surrounding module or function.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);

// Define AdminRoute; its parameters and body implement this operation.
export default function AdminRoute({ children, permission }) {
  // Declare { user, token, loading, hasPermission } for use by the surrounding module or function.
  const { user, token, loading, hasPermission } = useAuth();
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Declare isPlatformOwner for use by the surrounding module or function.
  const isPlatformOwner = PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());
  // Declare isManagerContentRoute for use by the surrounding module or function.
  const isManagerContentRoute = role === "manager" && MANAGER_CONTENT_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  // Check the condition (loading) and run the matching branch.
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  // Check the condition (!token || !user) and run the matching branch.
  if (!token || !user) return <Navigate to="/login" replace />;

  // SuperAdmin is a platform-level account and must never enter the tenant
  // AdminDashboard, which intentionally requires a tenant context. Send the
  // platform owner to the dedicated global console instead.
  // Check the condition (isPlatformOwner) and run the matching branch.
  if (isPlatformOwner) return <Navigate to="/superadmin/dashboard" replace />;

  // Check the condition (!isAdmin(user) && !isManagerContentRoute) and run the matching branch.
  if (!isAdmin(user) && !isManagerContentRoute) return <Navigate to="/" replace />;
  // Check the condition (permission && !hasPermission(permission)) and run the matching branch.
  if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;

  // Return the expression shown below to the caller.
  return children || <Outlet />;
}
