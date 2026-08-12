import {useQuery} from "@tanstack/react-query";
import {getSystemHealth} from "../../api/superAdminApi";

export default function SuperAdminSystem(){

const {data,isLoading}=useQuery({
queryKey:["system-health"],
queryFn:getSystemHealth
});


if(isLoading)
return <div className="p-6">Checking system...</div>


const system=data?.system || data || {};

return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">
System Health
</h1>


<div className="grid md:grid-cols-3 gap-4">

{
Object.entries(system).map(([k,v])=>(

<div className="bg-white shadow rounded-xl p-5" key={k}>

<p className="text-gray-500 capitalize">
{k}
</p>

<p className="font-bold mt-2">
{typeof v==="object"
? JSON.stringify(v)
: String(v)}
</p>

</div>

))
}

</div>

</div>

)

}
