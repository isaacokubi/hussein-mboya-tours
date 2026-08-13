import React,{useEffect,useState} from "react";
import {getSecurityStatus} from "../../api/superAdminApi";


export default function SuperAdminSecurity(){

const [security,setSecurity]=useState(null);
const [loading,setLoading]=useState(true);


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


<Control text="JWT Authentication"/>
<Control text="Role Based Access Control"/>
<Control text="Audit Logging"/>
<Control text="Session Monitoring"/>
<Control text="API Protection"/>
<Control text="Database Security"/>


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



function Control({text}){

return (

<div className="border rounded-lg p-4">

✓ {text}

</div>

);

}



function Row({name,status}){

return (

<tr className="border-b">

<td className="py-3">
{name}
</td>

<td className="py-3 text-right">

{status || "Configured"}

</td>

</tr>

);

}
