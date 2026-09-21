import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";

export default function ProtectedAdminRoute({ permission }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const roleName = getUserRole(user);
  const allowedRoles = ["admin", "super_admin"];
  if (!allowedRoles.includes(roleName)) return <Navigate to="/admin/login" replace />;

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <Outlet />;
}
