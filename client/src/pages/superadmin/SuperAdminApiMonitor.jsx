import {useQuery} from "@tanstack/react-query";
import {getApiMonitor} from "../../api/superAdminApi";


export default function SuperAdminApiMonitor(){

const {data,isLoading,error}=useQuery({
queryKey:["superadmin-api"],
queryFn:async()=>{
const res=await getApiMonitor();
return res.data || {};
}
});


if(isLoading)
return <div className="p-8">
Checking API...
</div>;


if(error)
return <div className="p-8 text-red-600">
API monitor unavailable
</div>;


const api =
data.api ||
data.data ||
data ||
{};


return (

<div className="p-8 space-y-6">

<h1 className="text-3xl font-bold">
API Monitor
</h1>


<div className="bg-white border rounded-xl p-6">

<p>
Status:
<strong>
{" "}
{api.status || api.health || "Unknown"}
</strong>
</p>


<p>
Service:
{" "}
{api.service || api.name || "API Service"}
</p>


<p>
Timestamp:
{" "}
{api.timestamp || api.time || new Date().toISOString()}
</p>


</div>

</div>

)

}