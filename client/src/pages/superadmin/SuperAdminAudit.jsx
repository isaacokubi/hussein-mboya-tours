import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../api/superAdminApi";


export default function SuperAdminAudit(){

const [search,setSearch]=useState("");

const {
data,
isLoading,
isError
}=useQuery({
queryKey:["superadmin-audit"],
queryFn:getAuditLogs
});


const logs =
data?.logs ||
data?.auditLogs ||
data ||
[];


const filteredLogs = logs.filter((log)=>{

const text = JSON.stringify(log).toLowerCase();

return text.includes(search.toLowerCase());

});


return (

<div className="p-6 space-y-6">


<div>

<h1 className="text-3xl font-bold">
Audit Center
</h1>

<p className="text-gray-500">
Monitor platform activities and administrative actions
</p>

</div>


<div className="bg-white border rounded-xl p-5">

<input
className="border rounded-lg px-4 py-3 w-full"
placeholder="Search audit activity..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</div>



<div className="bg-white border rounded-xl overflow-hidden">


{isLoading && (

<div className="p-6">
Loading audit records...
</div>

)}



{isError && (

<div className="p-6 text-red-600">
Failed to load audit records.
</div>

)}



{
!isLoading && filteredLogs.length===0 && (

<div className="p-6 text-gray-500">
No audit activity found.
</div>

)
}



<div className="divide-y">

{filteredLogs.map((log,index)=>(


<div
key={log._id || index}
className="p-5 hover:bg-gray-50"
>


<div className="flex justify-between gap-4">


<div>

<h3 className="font-semibold">
{
log.action ||
log.event ||
log.message ||
"System Activity"
}
</h3>


<p className="text-sm text-gray-500 mt-1">
{
log.description ||
log.details ||
"Administrative action recorded"
}
</p>


</div>


<div className="text-sm text-gray-500">

{
log.createdAt
?
new Date(log.createdAt).toLocaleString()
:
""

}

</div>


</div>


</div>


))}

</div>


</div>


</div>

);

}
