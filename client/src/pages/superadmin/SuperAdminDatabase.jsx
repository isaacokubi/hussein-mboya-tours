
import {useQuery} from "@tanstack/react-query";
import {
getDatabaseStatus
} from "../../api/superAdminApi";

import axios from "../../api/axios";


export default function SuperAdminDatabase(){

const runAction = async(endpoint)=>{
  try{

    await axios.post(endpoint);

    alert("Operation completed successfully");

  }catch(error){

    alert(
      error.response?.data?.message ||
      "Operation failed"
    );

  }
};


const {
data,
isLoading,
error,
refetch
}=useQuery({

queryKey:[
"superadmin-database"
],

queryFn:getDatabaseStatus,

refetchInterval:30000

});


if(isLoading)

return (

<div className="p-8">
Checking database status...
</div>

);


if(error)

return (

<div className="p-8 text-red-600">
Database connection unavailable
</div>

);


const db=data?.database || {};


return (

<div className="p-8 space-y-8">


<div className="flex justify-between items-center">

<div>

<h1 className="text-3xl font-bold">
Database Management
</h1>

<p className="text-gray-500">
Production database monitoring
</p>

</div>


<button

onClick={()=>refetch()}

className="px-5 py-2 rounded-lg bg-black text-white"

>
Refresh
</button>

</div>



<div className="grid md:grid-cols-4 gap-5">


<Card
title="Status"
value={db.status}
/>


<Card
title="Host"
value={db.host}
/>


<Card
title="Database"
value={db.name}
/>


<Card
title="Environment"
value={db.environment}
/>


</div>



<div className="bg-white border rounded-xl p-6">


<h2 className="font-bold text-xl">
Database Tools
</h2>


<div className="grid md:grid-cols-2 gap-4 mt-5">


<button
onClick={()=>runAction("/superadmin/maintenance/backup")}
className="border rounded-xl p-5 text-left hover:bg-gray-50"
>

<h3 className="font-semibold">
Create Backup
</h3>

<p className="text-sm text-gray-500">
Generate database backup snapshot
</p>

</button>


<button
onClick={()=>runAction("/superadmin/maintenance/cache")}
className="border rounded-xl p-5 text-left hover:bg-gray-50"
>

<h3 className="font-semibold">
Clear Cache
</h3>

<p className="text-sm text-gray-500">
Clear temporary system data
</p>

</button>


</div>


<p className="text-sm text-gray-500 mt-6">

Last checked:
{" "}
{db.checkedAt
?
new Date(db.checkedAt).toLocaleString()
:
"Unknown"}

</p>


</div>


</div>

)

}



function Card({title,value}){

return (

<div className="border rounded-xl p-5 bg-white">

<p className="text-gray-500 text-sm">
{title}
</p>

<p className="font-bold mt-2">
{value || "Unknown"}
</p>

</div>

)

}
