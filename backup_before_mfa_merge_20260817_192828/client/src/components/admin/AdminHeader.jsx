import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader({onMenu}){
  const navigate=useNavigate();
  const {user}=useAuth();
  const logout=()=>{localStorage.removeItem("token");localStorage.removeItem("user");localStorage.removeItem("permissions");navigate("/admin/login");};
  const name=user?.name || user?.email || "Administrator";
  return <header className="ops-header">
    <div style={{display:"flex",alignItems:"center",gap:12}}><button className="ops-mobile-trigger" onClick={onMenu} aria-label="Open navigation"><Menu size={20}/></button><div><div className="ops-header-title">Operations Control Center</div><div className="ops-header-sub">Bookings · finance · fleet · staff · customer operations</div></div></div>
    <div className="ops-user"><Bell size={18} color="#6b7b74"/><div className="ops-avatar">{name.charAt(0).toUpperCase()}</div><div><div className="ops-user-name">{name}</div><div className="ops-user-role">{user?.role?.name || user?.role || "Administrator"}</div></div><button className="ops-btn" onClick={logout}><LogOut size={14} style={{verticalAlign:"middle",marginRight:5}}/>Logout</button></div>
  </header>;
}
