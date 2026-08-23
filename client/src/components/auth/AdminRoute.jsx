import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole, isAdmin } from "../../utils/roleUtils";

const MANAGER_CONTENT_PATHS = ["/admin/gallery"];

export default function AdminRoute({ children, permission }) {
  const { user, token, loading, hasPermission } = useAuth();
  const location = useLocation();
  const role = getUserRole(user);
  const isManagerContentRoute = role === "manager" && MANAGER_CONTENT_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isAdmin(user) && !isManagerContentRoute) return <Navigate to="/" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;

  return children || <Outlet />;
}
