
import React from "react";
import {useQuery} from "@tanstack/react-query";
import {getAgents} from "../../api/adminAgentApi";


export default function Agents(){

const {data=[],isLoading}=useQuery({
queryKey:["agents"],
queryFn:getAgents
});


if(isLoading)
return <div className="p-6">Loading agents...</div>


return (

<div className="p-6">

<h1 className="text-2xl font-bold mb-5">
Agents Management
</h1>


<div className="bg-white rounded-xl shadow overflow-x-auto">

<table className="w-full">

<thead>
<tr className="border-b">

<th className="p-3 text-left">
Name
</th>

<th className="p-3 text-left">
Email
</th>

<th className="p-3 text-left">
Phone
</th>

<th className="p-3 text-left">
Status
</th>

</tr>
</thead>


<tbody>

{data.map(agent=>(

<tr key={agent._id} className="border-b">

<td className="p-3">
{agent.name}
</td>

<td className="p-3">
{agent.email}
</td>

<td className="p-3">
{agent.phone || "-"}
</td>

<td className="p-3">
{agent.status || "active"}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}
