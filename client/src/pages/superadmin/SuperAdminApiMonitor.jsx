import {useQuery} from "@tanstack/react-query";
import {getApiMonitor} from "../../api/superAdminApi";

export default function SuperAdminApiMonitor(){

const {data,isLoading}=useQuery({
queryKey:["api-monitor"],
queryFn:getApiMonitor
});


if(isLoading)
return <div className="p-6">Monitoring APIs...</div>


return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-5">
API Monitor
</h1>

<pre className="bg-white shadow rounded-xl p-5">
{JSON.stringify(data,null,2)}
</pre>

</div>

)

}
