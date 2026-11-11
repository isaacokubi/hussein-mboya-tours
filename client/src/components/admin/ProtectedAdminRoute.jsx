/**
 * Purpose: Protected Admin Route reusable UI component. Main declarations: ProtectedAdminRoute.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Navigate, Outlet } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole } from "../../utils/roleUtils";

// Define ProtectedAdminRoute; its parameters and body implement this operation.
export default function ProtectedAdminRoute({ permission }) {
  // Declare { user, loading, hasPermission } for use by the surrounding module or function.
  const { user, loading, hasPermission } = useAuth();

  // Check the condition (loading) and run the matching branch.
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  // Check the condition (!user) and run the matching branch.
  if (!user) return <Navigate to="/admin/login" replace />;

  // Declare roleName for use by the surrounding module or function.
  const roleName = getUserRole(user);
  // Declare allowedRoles for use by the surrounding module or function.
  const allowedRoles = ["admin", "super_admin"];
  // Check the condition (!allowedRoles.includes(roleName)) and run the matching branch.
  if (!allowedRoles.includes(roleName)) return <Navigate to="/admin/login" replace />;

  // Check the condition (permission && !hasPermission(permission)) and run the matching branch.
  if (permission && !hasPermission(permission)) {
    // Return the expression shown below to the caller.
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Return the expression shown below to the caller.
  return <Outlet />;
}
