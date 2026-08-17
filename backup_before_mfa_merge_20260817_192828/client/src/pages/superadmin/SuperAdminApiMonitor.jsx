import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {getApiMonitor} from "../../api/superAdminApi";


export default function SuperAdminApiMonitor(){

const [lastRefresh,setLastRefresh]=useState(new Date());

const {
data,
isLoading,
refetch
}=useQuery({

queryKey:["superadmin-api-monitor"],

queryFn:getApiMonitor,

refetchInterval:30000

});


if(isLoading)

return (
<div className="p-8">
Loading API Monitor...
</div>
);


const monitor =
data?.data || data || {};


return (

<div className="p-8 space-y-6">


<div className="flex justify-between items-center">

<h1 className="text-3xl font-bold">
API Monitor
</h1>


<button
onClick={async()=>{
await refetch();
setLastRefresh(new Date());
}}
className="px-4 py-2 border rounded-lg"
>
Refresh
</button>

</div>



<div className="grid md:grid-cols-4 gap-4">


<div className="border rounded-xl p-5">
<p>Status</p>
<h2 className="text-xl font-bold">
{monitor.status}
</h2>
</div>


<div className="border rounded-xl p-5">
<p>Health Score</p>
<h2 className="text-xl font-bold">
{monitor.healthScore}%
</h2>
</div>


<div className="border rounded-xl p-5">
<p>Database</p>
<h2 className="text-xl font-bold">
{monitor.database?.status}
</h2>
</div>


<div className="border rounded-xl p-5">
<p>Response</p>
<h2 className="text-xl font-bold">
{monitor.response}
</h2>
</div>


</div>



<div className="border rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
Server Information
</h2>


<p>
Node: {monitor.server?.nodeVersion}
</p>

<p>
Environment: {monitor.server?.environment}
</p>

<p>
Uptime: {monitor.server?.uptime}
</p>

<p>
Memory:
{" "}
{monitor.server?.memory?.used}
/
{monitor.server?.memory?.total}
</p>


</div>



<div className="border rounded-xl p-6">

<p className="text-sm mb-4">
Last checked: {lastRefresh.toLocaleTimeString()}
</p>

<h2 className="text-xl font-bold mb-4">
Endpoint Health
</h2>


{
monitor.endpoints?.map(
(endpoint,index)=>(

<div
key={index}
className="flex justify-between border-b py-3"
>

<span>
{endpoint.endpoint}
</span>


<span>
{endpoint.status}
{" "}
{endpoint.responseTime}
</span>


</div>

)

)

}


</div>



</div>

)

}
