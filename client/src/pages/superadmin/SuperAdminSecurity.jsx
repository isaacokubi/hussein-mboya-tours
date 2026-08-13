import React,{useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {getSecurityStatus} from "../../api/superAdminApi";


export default function SuperAdminSecurity(){

const [security,setSecurity]=useState(null);
const [loading,setLoading]=useState(true);
const navigate=useNavigate();


useEffect(()=>{

loadSecurity();

},[]);


async function loadSecurity(){

try{

const response=await getSecurityStatus();

console.log("SECURITY API RESPONSE:", response);

setSecurity(
response?.data || response
);

}
catch(error){

console.error("Security load failed",error);

}
finally{

setLoading(false);

}

}



if(loading){

return (

<div className="p-8">

Loading security infrastructure...

</div>

);

}



const data=security || {};


return (

<div className="p-8 space-y-8">


<div>

<h1 className="text-3xl font-bold">
Security Center
</h1>

<p className="text-gray-500">
Platform authentication, authorization and threat monitoring
</p>

</div>



<div className="grid md:grid-cols-4 gap-6">


<Card
title="Security Score"
value={`${data.securityScore || 0}/100`}
/>


<Card
title="Threat Level"
value={data.threatLevel || "Low"}
/>


<Card
title="Authentication"
value={
typeof data.authentication === "object"
? data.authentication.status || "Active"
: data.authentication || "Unknown"
}
/>


<Card
title="Authorization"
value={
typeof data.authorization === "object"
? `Roles: ${data.authorization.roles || 0} | Permissions: ${data.authorization.permissions || 0} | Admins: ${data.authorization.admins || 0}`
: data.authorization || "Unknown"
}
/>


</div>




<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-5">
Security Controls
</h2>


<div className="grid md:grid-cols-2 gap-4">


<Control
text="JWT Authentication"
path="/superadmin/security/jwt"
/>

<Control
text="Role Based Access Control"
path="/superadmin/roles"
/>

<Control
text="Audit Logging"
path="/superadmin/audit"
/>

<Control
text="Session Monitoring"
path="/superadmin/security/sessions"
/>

<Control
text="API Protection"
path="/superadmin/security/api"
/>

<Control
text="Database Security"
path="/superadmin/database"
/>


</div>


</div>




<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-5">
System Protection Status
</h2>


<table className="w-full">

<tbody>

<Row
name="Authentication Service"
status={
typeof data.authentication === "object"
? data.authentication.status
: data.authentication
}
/>

<Row
name="Authorization Service"
status={
typeof data.authorization === "object"
? data.authorization.status
: data.authorization
}
/>

<Row
name="Database"
status={data.database}
/>


</tbody>

</table>


</div>



</div>

);

}



function Card({title,value}){

return (

<div className="bg-white rounded-xl shadow p-5">

<h3 className="text-gray-500">
{title}
</h3>

<p className="text-3xl font-bold mt-2">
{value}
</p>

</div>

);

}
















function Row({name,status}){

return (

<tr className="border-b">

<td className="py-3 font-medium">
{name}
</td>

<td className="py-3 text-right">

<span className="px-3 py-1 rounded bg-gray-100">

{
typeof status === "object"
?
JSON.stringify(status)
:
status || "Unknown"
}

</span>

</td>

</tr>

);

}










function Control({text,path}){

const navigate = useNavigate();


return (

<button

onClick={()=>navigate(path)}

className="bg-gray-50 rounded-xl p-4 text-left hover:shadow transition cursor-pointer"

>

✓ {text}

</button>

);

}

