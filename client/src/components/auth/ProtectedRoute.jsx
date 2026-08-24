import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

const ROLE_PARENTS = {
  // Canonical role is `super_admin`; keep `superadmin` as a legacy alias.
  super_admin: new Set(["super_admin", "admin", "manager", "agent", "guide", "driver"]),
  superadmin: new Set(["super_admin", "admin", "manager", "agent", "guide", "driver"]),
  // Administrative access may inherit other operational permissions where
  // explicitly intended, but it must never make the Admin account a Tour
  // Manager. Tour Manager is a distinct dashboard and role boundary.
  admin: new Set(["admin", "agent", "guide", "driver"]),
};

function roleAllowed(userRole, allowedRoles) {
  if (!allowedRoles.length) return true;

  // Tour-manager routes are role-exclusive. This is intentionally checked
  // before the normal role inheritance/explicit-role checks because older
  // routes still contain `admin` in their allowedRoles list for compatibility.
  // An authenticated Admin must therefore be redirected to /admin/dashboard,
  // never rendered inside TourManagerLayout.
  const managerRoute = allowedRoles.some((role) => role === "manager");
  if (managerRoute && userRole !== "manager") return false;

  if (allowedRoles.includes(userRole)) return true;

  const inheritedRoles = ROLE_PARENTS[userRole];
  if (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role))) {
    return true;
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
