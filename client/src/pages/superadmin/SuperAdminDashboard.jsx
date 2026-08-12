import {useQuery} from "@tanstack/react-query";
import {getSuperAdminDashboard} from "../../api/superAdminApi";

export default function SuperAdminDashboard(){

const {data,isLoading}=useQuery({
queryKey:["superadmin-dashboard"],
queryFn:getSuperAdminDashboard
});

if(isLoading)
return <div className="p-6">Loading dashboard...</div>;

const stats=data?.stats || {};

return (
<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
Super Admin Control Center
</h1>

<p className="text-gray-600">
Complete system overview and platform administration.
</p>


<div className="grid md:grid-cols-3 gap-5">

{Object.entries(stats).map(([key,value])=>(

<div key={key}
className="bg-white rounded-xl shadow p-5">

<p className="text-gray-500 capitalize">
{key}
</p>

<h2 className="text-3xl font-bold mt-2">
{value}
</h2>

</div>

))}

</div>

</div>
)

}
