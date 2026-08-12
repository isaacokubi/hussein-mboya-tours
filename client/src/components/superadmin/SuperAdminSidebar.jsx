
import React from "react";
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
X
} from "lucide-react";


export default function SuperAdminSidebar({open,setOpen}){


const links=[
["Dashboard","/superadmin/dashboard",Activity],
["User Management","/superadmin/users",Users],
["Roles & Permissions","/superadmin/roles",KeyRound],
["Audit Center","/superadmin/audit",FileSearch],
["Security Center","/superadmin/security",Lock],
["System Health","/superadmin/system",Server],
["Platform Settings","/superadmin/settings",Settings],
["Database Tools","/superadmin/database",Database],
["API Monitor","/superadmin/api",Shield]
];


return (

<>

{open &&
<div
className="
fixed inset-0
bg-black/50
z-40
md:hidden
"
onClick={()=>setOpen(false)}
/>
}


<aside
className={`
fixed
z-50
top-0
left-0
h-screen
w-72
bg-gray-950
text-white
p-6
shadow-xl
transform
transition-transform
duration-300

${open?"translate-x-0":"-translate-x-full"}

md:translate-x-0

`}
>


<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-2xl font-bold">
Coherent Tours
</h1>

<p className="text-gray-400 text-sm">
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


<nav className="space-y-2">

{
links.map(([name,path,Icon])=>(

<NavLink
key={path}
to={path}
onClick={()=>setOpen(false)}

className={({isActive})=>
`
flex items-center gap-3
px-4 py-3
rounded-xl

${
isActive
?
"bg-blue-600 text-white"
:
"text-gray-300 hover:bg-gray-800"
}

`
}

>

<Icon size={20}/>

{name}

</NavLink>

))
}


</nav>


<div
className="
mt-10
bg-gray-900
border border-gray-800
rounded-xl
p-4
"
>

<p className="text-xs text-gray-400">
Access Level
</p>


<p className="text-green-400 font-bold">
SUPER ADMIN
</p>


</div>


</aside>


</>

)

}
