import {useQuery} from "@tanstack/react-query";
import {getDatabaseStatus} from "../../api/superAdminApi";


export default function SuperAdminDatabase(){

const {data,isLoading,error}=useQuery({
queryKey:["superadmin-database"],
queryFn:async()=>{
const res=await getDatabaseStatus();
return res.data || {};
}
});


if(isLoading)
return <div className="p-8">
Loading database...
</div>;


if(error)
return <div className="p-8 text-red-600">
Database information unavailable
</div>;


const db=data.database || data || {};


return (

<div className="p-8 space-y-6">

<h1 className="text-3xl font-bold">
Database Management
</h1>


<div className="grid md:grid-cols-3 gap-6">

<Card title="Status" value={db.status}/>
<Card title="Host" value={db.host}/>
<Card title="Database" value={db.name}/>

</div>


</div>

)

}


function Card({title,value}){

return (

<div className="bg-white border rounded-xl p-6">

<p className="text-gray-500">
{title}
</p>

<p className="font-bold mt-2">
{value || "Unknown"}
</p>

</div>

)

}