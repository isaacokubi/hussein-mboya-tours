import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, CalendarCheck, Wallet, Users, Car, Settings, PlusCircle, Edit, Smartphone, FileText, Home, Shield, BarChart3, UserRoundCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sections = [
  { title:"Operations", items:[
    ["Dashboard","/admin",LayoutDashboard,"admin.dashboard"],
    ["Bookings","/admin/bookings",CalendarCheck,"booking.manage"],
    ["Tours","/admin/manage-tours",Map,"tour.manage"],
    ["Customers","/admin/customers",Users,"customer.view"],
    ["Guides","/admin/guides",Users,"staff.manage"],
    ["Vehicles","/admin/vehicles",Car,"staff.manage"],
    ["Custom Tour Requests","/admin/custom-tour-requests",FileText,"customer.view"],
  ]},
  { title:"Finance & Insight", items:[
    ["Finance","/admin/finance",Wallet,"finance.view"],
    ["M-Pesa Transactions","/admin/finance/transactions",Smartphone,"finance.view"],
    ["Reports","/admin/reports",FileText,"analytics.view"],
    ["Analytics","/admin/analytics",BarChart3,"analytics.view"],
  ]},
  { title:"Governance", items:[
    ["Staff & Users","/admin/staff",UserRoundCog,"staff.manage"],
    ["Roles & Permissions","/admin/rbac",Shield,"roles.manage"],
    ["Settings","/admin/settings",Settings,"settings.manage"],
    ["Website","/",Home,null],
  ]}
];

export default function AdminSidebar(){
  const {hasPermission}=useAuth();
  return <div>
    <div className="ops-brand"><div className="ops-brand-mark">CT</div><div><div className="ops-brand-title">COHERENT TOURS</div><div className="ops-brand-sub">Operations Center</div></div></div>
    {sections.map(section=><div key={section.title}><div className="ops-section">{section.title}</div><nav className="ops-nav">{section.items.map(([name,path,Icon,permission])=>{
      if(permission && !hasPermission(permission)) return null;
      return <NavLink key={path} to={path} end={path==="/admin"} className={({isActive})=>`ops-link ${isActive?"active":""}`}><Icon size={17}/><span>{name}</span></NavLink>;
    })}</nav></div>)}
    <div className="ops-alert" style={{marginTop:20}}>Operational mode: monitor bookings, payments, schedules and resources from one control surface.</div>
  </div>;
}
