import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

const ROLE_PARENTS = {
  super_admin: new Set(["super_admin", "admin", "tour_manager", "agent", "tour_guide", "driver"]),
  admin: new Set(["admin", "agent", "tour_guide", "driver"]),
};

function roleAllowed(userRole, allowedRoles) {
  if (!allowedRoles.length) return true;

  const managerRoute = allowedRoles.includes("tour_manager");
  if (managerRoute && userRole !== "tour_manager") return false;

  if (allowedRoles.includes(userRole)) return true;

  const inheritedRoles = ROLE_PARENTS[userRole];
  if (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role))) return true;

  return false;
}

export default function ProtectedRoute({ children, roles = [], permission }) {
  const { user, token, loading, hasPermission } = useAuth();
  const location = useLocation();
  const isMyBookingsRoute = location.pathname === "/my-bookings";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;
  if (isMyBookingsRoute) return children;

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
