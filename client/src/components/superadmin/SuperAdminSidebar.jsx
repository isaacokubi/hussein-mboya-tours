import React from "react";
import { NavLink } from "react-router-dom";
import {
Shield,
Users,
KeyRound,
FileSearch,
Lock,
Activity,
Settings,
Database,
Server
} from "lucide-react";


export default function SuperAdminSidebar(){


const links=[

{
name:"Dashboard",
path:"/superadmin/dashboard",
icon:Activity
},

{
name:"User Management",
path:"/superadmin/users",
icon:Users
},

{
name:"Roles & Permissions",
path:"/superadmin/roles",
icon:KeyRound
},

{
name:"Audit Center",
path:"/superadmin/audit",
icon:FileSearch
},

{
name:"Security Center",
path:"/superadmin/security",
icon:Lock
},

{
name:"System Health",
path:"/superadmin/system",
icon:Server
},

{
name:"Platform Settings",
path:"/superadmin/settings",
icon:Settings
},

{
name:"Database Tools",
path:"/superadmin/database",
icon:Database
},

{
name:"API Monitor",
path:"/superadmin/api",
icon:Shield
}

];


return (

<aside
className="
w-72
min-h-screen
bg-gray-950
text-white
p-6
shadow-xl
"
>


<div className="mb-8">

<h1 className="
text-2xl
font-bold
">
Coherent Tours
</h1>


<p className="
text-sm
text-gray-400
mt-1
">
Super Admin Console
</p>

</div>



<nav className="space-y-2">


{
links.map(({name,path,icon:Icon})=>(

<NavLink

key={path}

to={path}

className={({isActive})=>

`
flex items-center gap-3
px-4 py-3
rounded-xl
transition

${isActive
?
"bg-blue-600 text-white shadow-lg"
:
"text-gray-300 hover:bg-gray-800"
}

`

}

>


<Icon size={20}/>

<span>
{name}
</span>


</NavLink>


))

}


</nav>


<div className="
mt-10
p-4
rounded-xl
bg-gray-900
border
border-gray-800
">


<p className="
text-xs
text-gray-400
">
System Access Level
</p>


<p className="
font-bold
text-green-400
">
SUPER ADMIN
</p>


</div>


</aside>


);

}