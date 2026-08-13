import {useQuery} from "@tanstack/react-query";
import {getSystemHealth} from "../../api/superAdminApi";

export default function SuperAdminSystem(){

const {data,isLoading,error}=useQuery({
queryKey:["superadmin-system"],
queryFn:async()=>{
const res=await getSystemHealth();
return res.data || {};
}
});


if(isLoading)
return <div className="p-8">Loading system health...</div>;


if(error)
return <div className="p-8 text-red-600">
Failed loading system health
</div>;


const system=data.system || data || {};

const uptime =
typeof system.uptime==="number"
? Math.round(system.uptime)
: "N/A";


return (

<div className="p-8 space-y-6">

<h1 className="text-3xl font-bold">
System Health Center
</h1>


<div className="grid md:grid-cols-3 gap-6">

<Card title="Status" value={system.status}/>
<Card title="Node Version" value={system.node?.version || system.nodeVersion || "N/A"}/>
<Card title="Uptime" value={`${uptime} seconds`}/>

</div>


<div className="bg-white rounded-xl border p-6">

<h2 className="font-bold mb-4">
Runtime Information
</h2>

<pre className="text-sm overflow-auto">
{JSON.stringify(system,null,2)}
</pre>

</div>

</div>

)

}


function Card({title,value}){

return (

<div className="bg-white border rounded-xl p-6 shadow">

<p className="text-gray-500">
{title}
</p>

<p className="text-2xl font-bold mt-2">
{value ?? "N/A"}
</p>

</div>

)

}