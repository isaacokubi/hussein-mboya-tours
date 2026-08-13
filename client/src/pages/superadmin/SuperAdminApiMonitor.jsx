import {useQuery} from "@tanstack/react-query";
import {getApiMonitor} from "../../api/superAdminApi";


export default function SuperAdminApiMonitor(){

const {data,isLoading}=useQuery({
queryKey:["superadmin-api"],
queryFn:getApiMonitor
});


if(isLoading)
return <div className="p-6">Checking API...</div>;


const api=data?.api||{};


return (

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
API Monitor
</h1>


<div className="bg-white border rounded-xl p-6">

<p>Status:
<strong>{api.status}</strong>
</p>

<p>
Service:
{api.service}
</p>

<p>
{api.timestamp}
</p>

</div>


</div>

)

}