import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

const ROLE_PARENTS = {
  superadmin: new Set(["super_admin", "admin", "manager", "agent", "guide", "driver"]),
  // Backend adminOnly/managerOnly/agentOnly/driverOnly/guideOnly gates
  // intentionally allow Admin access to operational staff areas.
  admin: new Set(["admin", "manager", "agent", "guide", "driver"]),
};

function roleAllowed(userRole, allowedRoles) {
  if (!allowedRoles.length) return true;
  if (allowedRoles.includes(userRole)) return true;

  const inheritedRoles = ROLE_PARENTS[userRole];
  if (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role))) {
    return true;
  }

  // Customer is intentionally not an operational parent role.
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
