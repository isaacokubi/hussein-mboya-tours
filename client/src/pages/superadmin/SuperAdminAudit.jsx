
import {useQuery} from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminAudit(){


const {
data,
isLoading
}=useQuery({

queryKey:["audit-center"],

queryFn:async()=>{

const res =
await api.get("/superadmin/audit");

return res.data;

}

});


const logs=data?.logs || [];

const stats=data?.statistics || {};



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Audit Center
</h1>



<div className="grid md:grid-cols-4 gap-4">


<div className="bg-white shadow rounded-xl p-5">
<h3>Total Events</h3>
<p className="text-3xl font-bold">
{stats.total || 0}
</p>
</div>



<div className="bg-white shadow rounded-xl p-5">
<h3>Successful</h3>
<p className="text-3xl font-bold">
{stats.success || 0}
</p>
</div>



<div className="bg-white shadow rounded-xl p-5">
<h3>Failed</h3>
<p className="text-3xl font-bold">
{stats.failed || 0}
</p>
</div>



<div className="bg-white shadow rounded-xl p-5">
<h3>Critical</h3>
<p className="text-3xl font-bold">
{stats.critical || 0}
</p>
</div>


</div>




<div className="bg-white rounded-xl shadow overflow-hidden">


<table className="w-full">


<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
Action
</th>


<th className="p-3 text-left">
User
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


{isLoading && (

<tr>
<td className="p-5">
Loading audit logs...
</td>
</tr>

)}



{logs.map((log)=>(


<tr
key={log._id}
className="border-t"
>


<td className="p-3 font-semibold">
{log.action}
</td>



<td className="p-3">

{
log.user
?
`${log.user.name || ""} ${log.user.email || ""}`
:
"System"
}

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



<td className="p-3 text-sm">
{
new Date(
log.createdAt
).toLocaleString()
}
</td>



</tr>


))}



</tbody>


</table>


</div>



</div>

)

}

