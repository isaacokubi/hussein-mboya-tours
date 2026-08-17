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





const downloadBackup = async(id)=>{

try{

const token =
localStorage.getItem("token");


const response =
await axios.get(
"/superadmin/database/backup/"+id+"/download",
{
headers:{
Authorization:`Bearer ${token}`
},
responseType:"blob"
}
);


const url =
window.URL.createObjectURL(
new Blob([response.data])
);


const link =
document.createElement("a");

link.href=url;

link.download =
"database-backup.json";

document.body.appendChild(link);

link.click();

link.remove();

window.URL.revokeObjectURL(url);


}
catch(error){

console.error(
"DOWNLOAD BACKUP ERROR",
error
);

alert(
"Unable to download backup"
);

}

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

[...backups.backups]
.sort(
(a,b)=>
new Date(b.createdAt)-new Date(a.createdAt)
)
.map((b,index)=>(

<div
key={b._id}
className="border rounded-xl p-5 mb-4 shadow-sm"
>

<div className="flex justify-between items-start">

<div>

<p className="font-bold text-lg">
{b.file}
</p>

<p className="text-sm">
Size: {b.size}
</p>


<p className="text-sm">
Database: {b.databaseName || "husseindb"}
</p>


<p className="text-sm">
Environment: {b.environment || "production"}
</p>


<p className="text-sm">
Created By: {b.createdBy || "system"}
</p>


<p className="text-sm">
Collections:
{" "}
{Array.isArray(b.collections)
?
b.collections.length
:
0}
</p>


{
Array.isArray(b.collections)
&&
b.collections.length > 0
&&

<details className="mt-3">

<summary className="cursor-pointer text-blue-600">
View Collections
</summary>


<div className="grid grid-cols-2 gap-2 mt-3 text-sm">

{
b.collections.map(
(collection)=>(
<span
key={collection}
className="border rounded px-2 py-1"
>
{collection}
</span>
)
)
}

</div>

</details>

}


<p className="text-gray-500 text-sm mt-2">

Created:

{" "}

{
new Date(
b.createdAt
).toLocaleString()
}

</p>


{
index===0 &&

<span className="inline-block mt-2 text-green-600 font-semibold">
Latest Backup
</span>

}

</div>


<div className="flex gap-4 mt-2">


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
