
import React,{useEffect,useState} from "react";
import api from "../../api/axios";

export default function SuperAdminRoles(){

const [roles,setRoles]=useState([]);
const [permissions,setPermissions]=useState([]);
const [error,setError]=useState("");

useEffect(()=>{
load();
},[]);


async function load(){

try{

const r = await api.get("/admin/roles");
const p = await api.get("/admin/roles/permissions/all");

setRoles(r.data.data || r.data.roles || []);
setPermissions(p.data.data || p.data.permissions || []);

}catch(e){

setError("Unable to load roles and permissions");

}

}


return (

<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
Roles & Permissions Management
</h1>


{error && <p className="text-red-600">{error}</p>}


<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-semibold mb-4">
System Roles
</h2>

<div className="space-y-3">

{roles.map((role,i)=>(

<div key={i}
className="border rounded-lg p-4">

<h3 className="font-bold">
{role.name || role.role || "Role"}
</h3>

<p className="text-sm text-gray-600">
{role.description || "System access role"}
</p>

</div>

))}

</div>

</div>



<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-semibold mb-4">
Available Permissions
</h2>


<div className="grid gap-2">

{permissions.map((p,i)=>(

<div
key={i}
className="border rounded-lg p-3">

{p.name || p.permission || p}

</div>

))}

</div>


</div>


</div>


</div>

)

}
