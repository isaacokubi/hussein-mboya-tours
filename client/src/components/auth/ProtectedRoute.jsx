/**
 * Purpose: Protected Route reusable UI component. Main declarations: roleAllowed, ProtectedRoute.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Navigate, useLocation } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { dashboardPath, getUserRole, normalizeRole } from "../../utils/roleUtils";

// Declare ROLE_PARENTS for use by the surrounding module or function.
const ROLE_PARENTS = {
  super_admin: new Set(["super_admin", "admin", "tour_manager", "agent", "tour_guide", "driver"]),
  admin: new Set(["admin", "agent", "tour_guide", "driver"]),
};

// Define roleAllowed; its parameters and body implement this operation.
function roleAllowed(userRole, allowedRoles) {
  // Check the condition (!allowedRoles.length) and run the matching branch.
  if (!allowedRoles.length) return true;

  // Declare managerRoute for use by the surrounding module or function.
  const managerRoute = allowedRoles.includes("tour_manager");
  // Check the condition (managerRoute && userRole !== "tour_manager") and run the matching branch.
  if (managerRoute && userRole !== "tour_manager") return false;

  // Check the condition (allowedRoles.includes(userRole)) and run the matching branch.
  if (allowedRoles.includes(userRole)) return true;

  // Declare inheritedRoles for use by the surrounding module or function.
  const inheritedRoles = ROLE_PARENTS[userRole];
  // Check the condition (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role)) and run the matching branch.
  if (inheritedRoles && allowedRoles.some((role) => inheritedRoles.has(role))) return true;

  // Return the expression shown below to the caller.
  return false;
}

// Define ProtectedRoute; its parameters and body implement this operation.
export default function ProtectedRoute({ children, roles = [], permission }) {
  // Declare { user, token, loading, hasPermission } for use by the surrounding module or function.
  const { user, token, loading, hasPermission } = useAuth();
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Declare isMyBookingsRoute for use by the surrounding module or function.
  const isMyBookingsRoute = location.pathname === "/my-bookings";

  // Check the condition (loading) and run the matching branch.
  if (loading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // Check the condition (!token || !user) and run the matching branch.
  if (!token || !user) return <Navigate to="/login" replace />;
  // Check the condition (isMyBookingsRoute) and run the matching branch.
  if (isMyBookingsRoute) return children;

  // Declare userRole for use by the surrounding module or function.
  const userRole = getUserRole(user);
  // Declare allowedRoles for use by the surrounding module or function.
  const allowedRoles = roles.map(normalizeRole);

  // Check the condition (!roleAllowed(userRole, allowedRoles)) and run the matching branch.
  if (!roleAllowed(userRole, allowedRoles)) {
    // Return the expression shown below to the caller.
    return <Navigate to={dashboardPath(user)} replace />;
  }

  // Check the condition (permission && !hasPermission(permission)) and run the matching branch.
  if (permission && !hasPermission(permission)) {
    // Return the expression shown below to the caller.
    return <Navigate to="/unauthorized" replace />;
  }

  // Return the value of children to the caller.
  return children;
}
