import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminSystem(){

const {data,isLoading,refetch}=useQuery({

queryKey:["system-health"],

queryFn:async()=>{

const res = await api.get("/system/health");

return res.data;

},

refetchInterval:10000

});


if(isLoading){

return (
<div className="p-8">
Checking system health...
</div>
);

}


const system=data || {};


return (

<div className="p-8 space-y-6">


<div className="flex justify-between items-center">

<h1 className="text-3xl font-bold">
System Health Center
</h1>


<button

onClick={()=>refetch()}

className="px-4 py-2 bg-black text-white rounded-lg"

>
Refresh
</button>


</div>



<div className="grid md:grid-cols-3 gap-6">


<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
Status
</p>

<h2 className="text-2xl font-bold text-green-600">
{system.status || "Unknown"}
</h2>

</div>



<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
Database
</p>

<h2 className="text-2xl font-bold">

{system.database || "Unknown"}

</h2>

</div>



<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
Uptime
</p>

<h2 className="text-2xl font-bold">

{Math.floor((system.uptime || 0)/60)} minutes

</h2>

</div>


</div>




<div className="bg-white border rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
Runtime Information
</h2>


<div className="grid md:grid-cols-2 gap-4">


<div>
Node Version
<br/>
<strong>
{system.nodeVersion || "N/A"}
</strong>
</div>


<div>
Environment
<br/>
<strong>
{system.environment || "N/A"}
</strong>
</div>


<div>
Memory Usage
<br/>
<strong>
{system.memory?.used || "N/A"}
/
{system.memory?.total || "N/A"}
</strong>
</div>


<div>
Platform
<br/>
<strong>
{system.platform?.os || "N/A"}
{" "}
{system.platform?.architecture || ""}
</strong>
</div>


</div>

</div>




<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
Health Score
</p>

<h2 className="text-3xl font-bold text-green-600">
100%
</h2>

</div>


<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
Last Checked
</p>

<h2 className="text-lg font-bold">

{new Date(system.timestamp).toLocaleTimeString()}

</h2>

</div>


</div>


<div className="bg-white border rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
Memory Usage
</h2>


<div className="w-full bg-gray-200 rounded-full h-4">

<div
className="bg-green-600 h-4 rounded-full"
style={{
width:
`${Math.min(
(system.memory?.used?.replace(" MB","") /
system.memory?.total?.replace(" MB",""))*100,
100
)}%`
}}
>
</div>

</div>


<p className="mt-2">

{system.memory?.used}
/
{system.memory?.total}

</p>


</div>



</div>

);

}
