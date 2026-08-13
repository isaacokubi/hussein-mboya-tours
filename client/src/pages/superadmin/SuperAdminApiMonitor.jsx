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


const api=data.api || data || {};


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
{api.status || "Unknown"}
</strong>
</p>


<p>
Service:
{" "}
{api.service || "API Service"}
</p>


<p>
Timestamp:
{" "}
{api.timestamp || "N/A"}
</p>


</div>

</div>

)

}