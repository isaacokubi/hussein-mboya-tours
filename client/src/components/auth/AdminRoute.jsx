import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole, isAdmin } from "../../utils/roleUtils";

const MANAGER_CONTENT_PATHS = ["/admin/gallery"];
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);

export default function AdminRoute({ children, permission }) {
  const { user, token, loading, hasPermission } = useAuth();
  const location = useLocation();
  const role = getUserRole(user);
  const isPlatformOwner = PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());
  const isManagerContentRoute = role === "manager" && MANAGER_CONTENT_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  // SuperAdmin is a platform-level account and must never enter the tenant
  // AdminDashboard, which intentionally requires a tenant context. Send the
  // platform owner to the dedicated global console instead.
  if (isPlatformOwner) return <Navigate to="/superadmin/dashboard" replace />;

  if (!isAdmin(user) && !isManagerContentRoute) return <Navigate to="/" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;

  return children || <Outlet />;
}
