
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

const rolesRes = await api.get("/admin/roles");

const permRes = await api.get("/admin/roles/permissions/all");


setRoles(
 rolesRes.data.data ||
 rolesRes.data.roles ||
 []
);


setPermissions(
 permRes.data.data ||
 permRes.data.permissions ||
 []
);


}catch(err){

setError(err.message);

}

}


return (

<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
Roles & Permissions
</h1>


{error && (
<p className="text-red-600">
{error}
</p>
)}


<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white shadow rounded-xl p-6">

<h2 className="text-xl font-semibold mb-4">
System Roles
</h2>


<pre className="text-sm overflow-auto">
{JSON.stringify(roles,null,2)}
</pre>


</div>



<div className="bg-white shadow rounded-xl p-6">

<h2 className="text-xl font-semibold mb-4">
Available Permissions
</h2>


<pre className="text-sm overflow-auto">
{JSON.stringify(permissions,null,2)}
</pre>


</div>


</div>


</div>

)

}
