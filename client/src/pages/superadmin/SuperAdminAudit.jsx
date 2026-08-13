
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminAudit(){

const [page,setPage]=useState(1);
const [selected,setSelected]=useState(null);

const [filters,setFilters]=useState({
search:"",
severity:"",
status:"",
action:"",
resource:""
});


const {data,isLoading,error,refetch}=useQuery({

queryKey:[
"audit-center",
page,
filters
],

queryFn:async()=>{

const res=await api.get(
"/superadmin/audit",
{
params:{
page,
limit:20,
...filters
}
}
);

return res.data;

}

});


const logs=data?.logs || [];



return (

<div className="space-y-6">


<header>

<h1 className="text-3xl font-bold">
Audit Center
</h1>

<p className="text-gray-500">
Platform activity monitoring and security events
</p>

</header>



<div className="grid grid-cols-4 gap-4">


<Card title="Total Events" value={data?.statistics?.total || 0}/>
<Card title="Successful" value={data?.statistics?.success || 0}/>
<Card title="Failed" value={data?.statistics?.failed || 0}/>
<Card title="Critical" value={data?.statistics?.critical || 0}/>


</div>




<div className="grid grid-cols-5 gap-3">


<input
className="border rounded p-2"
placeholder="Search"
value={filters.search}
onChange={e=>
setFilters({...filters,search:e.target.value})
}
/>


<select
className="border rounded p-2"
onChange={e=>
setFilters({...filters,action:e.target.value})
}
>

<option value="">
Action
</option>

<option value="login">
Login
</option>

<option value="create">
Create
</option>

<option value="update">
Update
</option>

<option value="delete">
Delete
</option>

</select>



<select
className="border rounded p-2"
onChange={e=>
setFilters({...filters,severity:e.target.value})
}
>

<option value="">
Severity
</option>

<option value="critical">
Critical
</option>

<option value="high">
High
</option>

<option value="medium">
Medium
</option>

<option value="low">
Low
</option>

</select>



<select
className="border rounded p-2"
onChange={e=>
setFilters({...filters,status:e.target.value})
}
>

<option value="">
Status
</option>

<option value="success">
Success
</option>

<option value="failed">
Failed
</option>

</select>



<button
className="border rounded px-4"
onClick={()=>refetch()}
>
Refresh
</button>


</div>




<div className="bg-white rounded-xl shadow overflow-auto">


<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
User
</th>

<th>
Action
</th>

<th>
Resource
</th>

<th>
Description
</th>

<th>
Status
</th>

<th>
Severity
</th>

<th>
Date
</th>

</tr>

</thead>



<tbody>


{logs.map(log=>(


<tr
key={log._id}
className="border-t hover:bg-gray-50 cursor-pointer"
onClick={()=>setSelected(log)}
>


<td className="p-3">

{log.user?.name || "System"}

</td>


<td>
{log.action}
</td>


<td>
{log.resource}
</td>


<td>
{log.description || "-"}
</td>


<td>

<Badge value={log.status}/>

</td>


<td>

<Badge value={log.severity}/>

</td>


<td>
{new Date(log.createdAt).toLocaleString()}
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
onClick={()=>setPage(page+1)}
>
Next
</button>


</div>



{selected &&

<div className="fixed inset-0 bg-black/40 flex justify-end">


<div className="bg-white w-96 h-full p-6 overflow-auto">


<h2 className="text-xl font-bold mb-4">
Audit Details
</h2>


<pre className="text-sm whitespace-pre-wrap">

{JSON.stringify(
selected,
null,
2
)}

</pre>


<button
className="mt-5 border px-4 py-2 rounded"
onClick={()=>setSelected(null)}
>
Close
</button>


</div>

</div>

}



</div>

);

}



function Card({title,value}){

return (

<div className="bg-white shadow rounded-xl p-5">

<p className="text-gray-500">
{title}
</p>

<h2 className="text-3xl font-bold">
{value}
</h2>

</div>

);

}



function Badge({value}){

return (

<span className="px-2 py-1 rounded text-sm border">

{value}

</span>

);

}
