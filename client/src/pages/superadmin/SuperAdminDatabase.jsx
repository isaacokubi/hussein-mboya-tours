import {useQuery} from "@tanstack/react-query";
import {getDatabaseStatus} from "../../api/superAdminApi";

export default function SuperAdminDatabase(){

const {data,isLoading}=useQuery({
queryKey:["database-status"],
queryFn:getDatabaseStatus
});

if(isLoading)
return <div className="p-6">Checking database...</div>


return (

<div className="p-6">

<h1 className="text-3xl font-bold mb-5">
Database Status
</h1>

<pre className="bg-white shadow rounded-xl p-5">
{JSON.stringify(data,null,2)}
</pre>

</div>

)

}
