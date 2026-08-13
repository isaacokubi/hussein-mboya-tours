import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminAudit(){

const {
data:logs=[],
isLoading,
error
}=useQuery({

queryKey:["superadmin-audit"],

queryFn:async()=>{

const response = await api.get("/superadmin/audit");

const data=response.data;


/*
Handle different backend responses:
{
 logs:[]
}

or

{
 auditLogs:[]
}

or

[]
*/

const result =
Array.isArray(data.logs)
?
data.logs
:
Array.isArray(data.data)
?
data.data
:
Array.isArray(data.auditLogs)
?
data.auditLogs
:
Array.isArray(data)
?
data
:
[];


return result;

}

});



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Audit Center
</h1>


{isLoading && (

<div className="border rounded-xl p-5 bg-white">
Loading audit records...
</div>

)}



{error && (

<div className="border border-red-300 rounded-xl p-5 bg-red-50 text-red-700">

Failed to load audit records.

</div>

)}



<div className="space-y-4">


{logs.map((log,index)=>(

<div
key={log._id || index}
className="bg-white border rounded-xl p-5 shadow-sm"
>


<div className="font-semibold">

{
log.action ||
log.event ||
log.message ||
log.description ||
"System Activity"

}

</div>



{log.user && (

<p className="text-sm text-gray-600 mt-2">

User:
{
typeof log.user==="object"
?
(log.user.name || log.user.email)
:
log.user
}

</p>

)}



{log.createdAt && (

<p className="text-xs text-gray-500 mt-2">

{
new Date(log.createdAt).toLocaleString()

}

</p>

)}


</div>

))}



{
!isLoading && logs.length===0 && (

<div className="bg-white border rounded-xl p-5 text-gray-500">

No audit activities found.

</div>

)

}


</div>


</div>

)

}
