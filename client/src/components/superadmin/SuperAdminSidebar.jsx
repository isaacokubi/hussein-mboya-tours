import { useSettings } from "../../context/SettingsContext";

import {NavLink} from "react-router-dom";
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
ChevronRight
} from "lucide-react";


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


export default function SuperAdminSidebar({ open, setOpen }) {
  const { settings = {} } = useSettings() || {};


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
{settings.companyName || "Company"}
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
