import {useQuery} from "@tanstack/react-query";
import {getSystemHealth} from "../../api/superAdminApi";


export default function SuperAdminSystem(){

const {data,isLoading}=useQuery({
queryKey:["superadmin-system"],
queryFn:getSystemHealth
});


if(isLoading)
return <div className="p-6">Loading system health...</div>;


const system=data?.system||{};


return (

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
System Health Center
</h1>


<div className="grid md:grid-cols-3 gap-6">

<Card title="Status" value={system.status}/>
<Card title="Node Version" value={system.node}/>
<Card title="Uptime" value={`${Math.round(system.uptime)} seconds`}/>

</div>


<div className="bg-white rounded-xl border p-6">

<h2 className="font-bold mb-4">
Memory Usage
</h2>

<pre className="text-sm overflow-auto">
{JSON.stringify(system.memory,null,2)}
</pre>

</div>


</div>

)

}


function Card({title,value}){

return (

<div className="bg-white border rounded-xl p-5 shadow">

<p className="text-gray-500">
{title}
</p>

<p className="text-2xl font-bold mt-2">
{value||"N/A"}
</p>

</div>

)

}