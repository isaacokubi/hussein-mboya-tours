import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

export default function ProtectedRoute({ children, roles = [], permission }) {
  const { user, token, loading, hasPermission } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg font-semibold">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  const userRole = getUserRole(user);
  const allowedRoles = roles.map(normalizeRole);

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to={dashboardPath(user)} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
