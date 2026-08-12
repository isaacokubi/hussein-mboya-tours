import React from "react";
import { NavLink } from "react-router-dom";

export default function SuperAdminSidebar(){

const links=[
{
name:"Dashboard",
path:"/superadmin/dashboard"
},
{
name:"Users",
path:"/superadmin/users"
},
{
name:"Roles & Permissions",
path:"/superadmin/roles"
},
{
name:"System Health",
path:"/superadmin/system"
},
{
name:"Audit Logs",
path:"/superadmin/audit"
},
{
name:"Security",
path:"/superadmin/security"
}
];


return (
<div
style={{
width:"260px",
minHeight:"100vh",
background:"#111827",
color:"#fff",
padding:"20px"
}}
>

<h2>
Super Admin
</h2>

<hr/>

{
links.map(link=>(
<NavLink
key={link.path}
to={link.path}
style={{
display:"block",
padding:"12px",
marginBottom:"8px",
color:"#fff",
textDecoration:"none"
}}
>

{link.name}

</NavLink>
))
}

</div>
);

}
