/**
 * Purpose: Dashboard Logout Button reusable UI component. Main declarations: DashboardLogoutButton, handleLogout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { LogOut } from "lucide-react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";

// Define DashboardLogoutButton; its parameters and body implement this operation.
export default function DashboardLogoutButton({ className = "" }) {
  // Declare { logout } for use by the surrounding module or function.
  const { logout } = useAuth();
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();

  // Declare handleLogout for use by the surrounding module or function.
  const handleLogout = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await logout();
    } finally {
      // Perform the side effect or state update expressed on the following line.
      navigate("/login", { replace: true });
    }
  };

  // Return the expression shown below to the caller.
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:px-3 ${className}`}
      aria-label="Logout"
      title="Logout"
    >
      <LogOut size={16} aria-hidden="true" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
