import {useQuery} from "@tanstack/react-query";
import axios from "../../api/axios";
import {getDatabaseStatus} from "../../api/superAdminApi";


export default function SuperAdminDatabase(){


const {data}=useQuery({

queryKey:["database-status"],

queryFn:getDatabaseStatus

});



const {
data:backups,
refetch
}=useQuery({

queryKey:["database-backups"],

queryFn:
async()=>(
await axios.get(
"/superadmin/maintenance/backups"
)
).data

});



const action=async(url)=>{

try{

const res=
await axios.post(url);

alert(
res.data.message
);

refetch();


}catch(e){

alert(
e.response?.data?.message ||
"Operation failed"
);

}

};




const removeBackup=async(id)=>{


if(!confirm("Delete this backup?"))
return;


try{

await axios.delete(
"/superadmin/maintenance/backups/"+id
);


refetch();


}catch(e){

alert(
e.response?.data?.message ||
"Delete failed"
);

}


};




const downloadBackup=(id)=>{


window.open(

axios.defaults.baseURL +
"/superadmin/database/backup/"+id+"/download",

"_blank"

);


};




return (

<div className="p-8 space-y-8">


<h1 className="text-3xl font-bold">
Database Management
</h1>



<div className="grid md:grid-cols-3 gap-6">


<Card
title="Status"
value={
data?.database?.status ||
"Checking..."
}
/>


<Card
title="Host"
value={
data?.database?.host ||
"Loading..."
}
/>


<Card
title="Database"
value={
data?.database?.name ||
"Loading..."
}
/>


</div>




<div className="flex gap-4">


<button
className="px-5 py-3 rounded-xl bg-black text-white"
onClick={()=>action("/superadmin/database/backup")}
>
Create Backup
</button>



<button
className="px-5 py-3 rounded-xl border"
onClick={()=>action("/superadmin/database/cache-clear")}
>
Clear Cache
</button>


</div>





<div className="border rounded-xl p-6">


<h2 className="text-xl font-bold mb-4">
Database Backups
</h2>



{

backups?.backups?.length ?


backups.backups.map(b=>(


<div
key={b._id}
className="flex justify-between items-center border-b py-4"
>


<div>


<p className="font-semibold">
{b.file}
</p>



<p>
Size: {b.size}
</p>



<p>
Collections: {Array.isArray(b.collections) ? b.collections.length : 0}
</p>



<p className="text-sm text-gray-500">

Created:

{" "}

{
new Date(
b.createdAt
).toLocaleString()
}

</p>


</div>





<div className="flex gap-3">


<button

className="text-blue-600"

onClick={()=>downloadBackup(b._id)}

>

Download

</button>



<button

className="text-red-600"

onClick={()=>removeBackup(b._id)}

>

Delete

</button>



</div>



</div>


))


:

<p>
No backups available
</p>


}



</div>



</div>

)

}




function Card({title,value}){

return (

<div className="border rounded-xl p-6">

<p className="text-gray-500">
{title}
</p>

<p className="font-bold mt-2">
{value}
</p>

</div>

)

}
