import {useQuery} from "@tanstack/react-query";
import {getAuditLogs} from "../../api/superAdminApi";

export default function SuperAdminAudit(){

const {data,isLoading}=useQuery({
queryKey:["audit"],
queryFn:getAuditLogs
});


if(isLoading)
return <div className="p-6">Loading audit logs...</div>


const logs=data?.logs || data || [];


return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-5">
Audit Logs
</h1>


<div className="space-y-3">

{
Array.isArray(logs) &&
logs.map((log,i)=>(

<div key={i}
className="bg-white rounded-xl shadow p-4">

{JSON.stringify(log)}

</div>

))
}

</div>

</div>

)

}
