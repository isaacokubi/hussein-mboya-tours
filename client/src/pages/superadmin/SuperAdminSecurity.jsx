import {useQuery} from "@tanstack/react-query";
import {getSecurityStatus} from "../../api/superAdminApi";


export default function SuperAdminSecurity(){

const {data,isLoading}=useQuery({
queryKey:["superadmin-security"],
queryFn:getSecurityStatus
});


if(isLoading)
return <div className="p-6">Loading security...</div>;


const security=data?.security||{};


return (

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
Security Center
</h1>


<div className="grid md:grid-cols-3 gap-6">

<Card title="Authentication" value={security.authentication}/>
<Card title="Authorization" value={security.authorization}/>
<Card title="Admins" value={security.admins}/>

</div>

</div>

)

}


function Card({title,value}){

return <div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">{title}</p>

<h2 className="text-3xl font-bold">
{value}
</h2>

</div>

}