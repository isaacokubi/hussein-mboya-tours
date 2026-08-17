import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

const ROLE_PARENTS = {
  superadmin: new Set(["superadmin", "admin", "manager", "agent", "guide", "driver"]),
  admin: new Set(["admin"]),
};

function roleAllowed(userRole, allowedRoles) {
  if (!allowedRoles.length) return true;
  if (allowedRoles.includes(userRole)) return true;

  // SuperAdmin is an administrative superset for operational staff routes.
  // Customer is intentionally excluded so staff never inherit customer-only pages.
  if (userRole === "superadmin") {
    return allowedRoles.some((role) => ROLE_PARENTS.superadmin.has(role));
  }

  return false;
}

export default function ProtectedRoute({ children, roles = [], permission }) {
  const { user, token, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  const userRole = getUserRole(user);
  const allowedRoles = roles.map(normalizeRole);

  if (!roleAllowed(userRole, allowedRoles)) {
    return <Navigate to={dashboardPath(user)} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
