/**
 * Purpose: Admin Header reusable UI component. Main declarations: AdminHeader, handleLogout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useNavigate } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { Menu, Bell, LogOut } from "lucide-react";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";

// Define AdminHeader; its parameters and body implement this operation.
export default function AdminHeader({onMenu}){
  // Declare navigate for use by the surrounding module or function.
  const navigate=useNavigate();
  // Declare {user, logout} for use by the surrounding module or function.
  const {user, logout}=useAuth();
  // Declare handleLogout for use by the surrounding module or function.
  const handleLogout=async()=>{await logout(); navigate("/admin/login");};
  // Declare name for use by the surrounding module or function.
  const name=user?.name || user?.email || "Administrator";
  // Return the expression shown below to the caller.
  return <header className="ops-header">
    <div style={{display:"flex",alignItems:"center",gap:12}}><button className="ops-mobile-trigger" onClick={onMenu} aria-label="Open navigation"><Menu size={20}/></button><div><div className="ops-header-title">Operations Control Center</div><div className="ops-header-sub">Bookings · finance · fleet · staff · customer operations</div></div></div>
    <div className="ops-user"><Bell size={18} color="#6b7b74"/><div className="ops-avatar">{name.charAt(0).toUpperCase()}</div><div><div className="ops-user-name">{name}</div><div className="ops-user-role">{user?.role?.name || user?.role || "Administrator"}</div></div><button className="ops-btn" onClick={handleLogout}><LogOut size={14} style={{verticalAlign:"middle",marginRight:5}}/>Logout</button></div>
  </header>;
}
