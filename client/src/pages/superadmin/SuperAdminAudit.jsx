import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminAudit(){

const [page,setPage]=useState(1);
const [search,setSearch]=useState("");
const [severity,setSeverity]=useState("");
const [status,setStatus]=useState("");


const {data,isLoading,error,refetch}=useQuery({

queryKey:[
"audit-center",
page,
search,
severity,
status
],

queryFn:async()=>{

const res=await api.get(
"/superadmin/audit",
{
params:{
page,
limit:20,
search,
severity,
status
}
}
);

return res.data;

}

});


const logs=data?.logs || [];



return (

<div className="space-y-6">


<div>

<h1 className="text-3xl font-bold">
Audit Center
</h1>

<p className="text-gray-500">
Platform activity monitoring and security events
</p>

</div>



<div className="grid grid-cols-4 gap-4">


<Card
title="Total Events"
value={data?.statistics?.total || 0}
/>


<Card
title="Successful"
value={data?.statistics?.success || 0}
/>


<Card
title="Failed"
value={data?.statistics?.failed || 0}
/>


<Card
title="Critical"
value={data?.statistics?.critical || 0}
/>


</div>



<div className="flex gap-3">


<input
className="border rounded p-2 flex-1"
placeholder="Search audit activity..."
value={search}
onChange={e=>{
setPage(1);
setSearch(e.target.value);
}}
/>



<select
className="border rounded p-2"
value={severity}
onChange={e=>setSeverity(e.target.value)}
>

<option value="">
All Severity
</option>

<option value="critical">
Critical
</option>

<option value="warning">
Warning
</option>

<option value="info">
Info
</option>

</select>



<select
className="border rounded p-2"
value={status}
onChange={e=>setStatus(e.target.value)}
>

<option value="">
All Status
</option>

<option value="success">
Success
</option>

<option value="failed">
Failed
</option>

</select>



<button
className="px-4 py-2 border rounded"
onClick={()=>refetch()}
>
Refresh
</button>


</div>




<div className="bg-white rounded-xl shadow overflow-hidden">


<table className="w-full">


<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
User
</th>

<th className="p-3 text-left">
Action
</th>

<th className="p-3 text-left">
Resource
</th>

<th className="p-3 text-left">
Status
</th>

<th className="p-3 text-left">
Severity
</th>

<th className="p-3 text-left">
Date
</th>

</tr>

</thead>



<tbody>


{isLoading &&

<tr>
<td colSpan="6" className="p-5 text-center">
Loading audit logs...
</td>
</tr>

}



{error &&

<tr>
<td colSpan="6" className="p-5 text-center text-red-600">
Failed loading audit records
</td>
</tr>

}



{!isLoading && !error && logs.length===0 &&

<tr>
<td colSpan="6" className="p-5 text-center">
No audit activity found
</td>
</tr>

}



{logs.map(log=>(

<tr key={log._id}
className="border-t"
>

<td className="p-3">

{log.user?.name || "System"}

<br/>

<span className="text-xs text-gray-500">
{log.user?.role || ""}
</span>

</td>


<td className="p-3">
{log.action}
</td>


<td className="p-3">
{log.resource}
</td>


<td className="p-3">
{log.status}
</td>


<td className="p-3">
{log.severity}
</td>


<td className="p-3">
{new Date(log.createdAt)
.toLocaleString()}
</td>


</tr>

))}


</tbody>

</table>


</div>



<div className="flex justify-between">

<button
className="border px-4 py-2 rounded"
disabled={page<=1}
onClick={()=>setPage(page-1)}
>
Previous
</button>


<span>
Page {page} / {data?.pagination?.pages || 1}
</span>


<button
className="border px-4 py-2 rounded"
disabled={
page >= (data?.pagination?.pages || 1)
}
onClick={()=>setPage(page+1)}
>
Next
</button>


</div>


</div>

);

}



function Card({title,value}){

return (

<div className="bg-white shadow rounded-xl p-5">

<div className="text-gray-500">
{title}
</div>

<div className="text-3xl font-bold">
{value}
</div>

</div>

)

}
