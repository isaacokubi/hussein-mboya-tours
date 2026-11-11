/**
 * Purpose: Agent Route reusable UI component. Main declarations: AgentRoute.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Navigate, Outlet } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole } from "../../utils/roleUtils";

// Define AgentRoute; its parameters and body implement this operation.
export default function AgentRoute({ children }) {
  // Declare { user, token, loading } for use by the surrounding module or function.
  const { user, token, loading } = useAuth();

  // Check the condition (loading) and run the matching branch.
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  // Check the condition (!token || !user) and run the matching branch.
  if (!token || !user) return <Navigate to="/agent/login" replace />;
  // Check the condition (getUserRole(user) !== "agent") and run the matching branch.
  if (getUserRole(user) !== "agent") return <Navigate to="/" replace />;

  // AppRoutes supplies AgentLayout as a wrapper around the nested routes.
  // Render it when provided; otherwise preserve the normal Outlet contract.
  // Return the expression shown below to the caller.
  return children || <Outlet />;
}
