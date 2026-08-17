import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";

export default function AgentRoute() {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/agent/login" replace />;
  if (getUserRole(user) !== "agent") return <Navigate to="/" replace />;

  return <Outlet />;
}
