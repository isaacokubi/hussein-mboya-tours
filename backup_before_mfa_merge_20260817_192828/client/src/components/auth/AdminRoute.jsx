import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roleUtils";

export default function AdminRoute({ children, permission }) {
  const { user, token, loading, hasPermission } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isAdmin(user)) return <Navigate to="/" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;

  return children || <Outlet />;
}
