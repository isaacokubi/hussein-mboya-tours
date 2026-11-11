/**
 * Purpose: Super Admin Sidebar reusable UI component. Main declarations: normalizeRole, isSuperAdminUser, SuperAdminSidebar.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";

// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (user) => {
  // Check the condition (!user) and run the matching branch.
  if (!user) return "";
  // Check the condition (typeof user.role === "string") and run the matching branch.
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\\s-]/g, "_");
  // Check the condition (user.role?.name) and run the matching branch.
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\\s-]/g, "_");
  // Check the condition (Array.isArray(user.roles) && user.roles[0]?.name) and run the matching branch.
  if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\\s-]/g, "_");
  // Return a configured text value to the caller.
  return "";
};
// Declare isSuperAdminUser for use by the surrounding module or function.
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));

// Load react-router-dom so this module can use its exported dependencies.
import {NavLink} from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import {
Shield,
Users,
KeyRound,
FileSearch,
Lock,
Activity,
Settings,
Database,
Server,
X,
Gauge,
ChevronRight,
UserRound
} from "lucide-react";


// Declare sections for use by the surrounding module or function.
const sections=[

{
title:"Platform Management",
items:[
["Dashboard","/superadmin/dashboard",Gauge,"Overview and platform metrics"],
["User Management","/superadmin/users",Users,"Manage users and accounts"],
["Roles & Permissions","/superadmin/roles",KeyRound,"Control access policies"]
]
},

{
title:"Security & Monitoring",
items:[
["Audit Center","/superadmin/audit",FileSearch,"Review platform activities"],
["Security Center","/superadmin/security",Lock,"Authentication and protection"],
["System Health","/superadmin/system",Server,"Infrastructure monitoring"],
["API Monitor","/superadmin/api-monitor",Shield,"API availability tracking"]
]
},

{
title:"Configuration",
items:[
["Platform Settings","/superadmin/settings",Settings,"Global system configuration"],
["Database Tools","/superadmin/database",Database,"Database management"]
]
}

];


// Define SuperAdminSidebar; its parameters and body implement this operation.
export default function SuperAdminSidebar({ open, setOpen }) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare isPlatformOwner for use by the surrounding module or function.
  const isPlatformOwner = isSuperAdminUser(user);
  // Declare platformName for use by the surrounding module or function.
  const platformName = "Kenya Tours";


// Return the expression shown below to the caller.
return (

<>

{open &&
<div
className="fixed inset-0 bg-black/50 z-40 md:hidden"
onClick={()=>setOpen(false)}
/>
}


<aside
className={`
fixed z-50 top-0 left-0 h-screen w-80
bg-[#102b24] text-white
shadow-2xl
transition-transform duration-300
p-6
overflow-y-auto
${open?"translate-x-0":"-translate-x-full"}
md:translate-x-0
`}
>


<div className="flex justify-between items-start mb-8">


<div>

<div className="flex items-center gap-2">

<div className="p-2 rounded-xl bg-[#1b7658]">
<Shield size={22}/>
</div>


<h1 className="text-xl font-bold">
{isPlatformOwner ? platformName : (settings.companyName || "Company")}
</h1>


</div>


<p className="text-sm text-slate-400 mt-2">
Super Admin Console
</p>

</div>


<button
className="md:hidden"
onClick={()=>setOpen(false)}
>
<X/>
</button>


</div>



<nav className="space-y-7">


{
sections.map(section=>(

<div key={section.title}>


<p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
{section.title}
</p>



<div className="space-y-2">


{
section.items.map(([name,path,Icon,desc])=>(


<NavLink
key={path}
to={path}
onClick={()=>setOpen(false)}

className={({isActive})=>
`
group flex items-center justify-between
rounded-xl px-4 py-3
transition-all

${
isActive
?
"bg-[#1b7658] text-white shadow-lg"
:
"text-slate-300 hover:bg-white/10"
}
`
}


>


<div className="flex items-center gap-3">

<Icon size={20}/>


<div>

<div className="font-medium text-sm">
{name}
</div>


<div className="text-xs opacity-70 hidden lg:block">
{desc}
</div>


</div>


</div>


<ChevronRight
size={16}
className="opacity-50"
/>


</NavLink>


))

}


</div>


</div>


))

}


</nav>

<NavLink to="/profile" onClick={()=>setOpen(false)} className={({isActive})=>`mt-8 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${isActive?"bg-[#1b7658] text-white":"text-slate-300 hover:bg-white/10"}`}><UserRound size={20}/><span>My Profile & Email</span></NavLink>

<div className="
mt-10
rounded-2xl
bg-slate-900
border border-slate-800
p-5
">


<div className="flex items-center gap-2">

<Activity size={18} className="text-green-400"/>

<p className="text-sm text-slate-400">
Access Level
</p>

</div>


<p className="mt-2 text-green-400 font-bold">
SUPER ADMIN
</p>


<p className="text-xs text-slate-500 mt-1">
Full platform governance access
</p>


</div>



</aside>


</>

)

}
