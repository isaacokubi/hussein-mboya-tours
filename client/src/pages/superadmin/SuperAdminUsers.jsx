import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {getAdminUsers,updateUserStatus,deleteUser} from "../../api/adminUserApi";


export default function SuperAdminUsers(){

const [search,setSearch]=useState("");

const {data,isLoading,refetch}=useQuery({
queryKey:["superadmin-users",search],
queryFn:()=>getAdminUsers({search})
});


const users=data?.users || data?.data || data || [];


const status=async(id,value)=>{
await updateUserStatus({id,status:value});
refetch();
};


const remove=async(id)=>{
if(confirm("Delete this user permanently?")){
await deleteUser(id);
refetch();
}
};


return <div className="p-8 space-y-6">

<h1 className="text-3xl font-bold">
SuperAdmin User Management
</h1>

<div className="grid md:grid-cols-4 gap-4">

<Card title="Total Users" value={users.length}/>
<Card title="Active" value={users.filter(u=>u.status==="active").length}/>
<Card title="Admins" value={users.filter(u=>String(u.role).includes("admin")).length}/>
<Card title="Customers" value={users.filter(u=>u.role==="customer").length}/>

</div>


<input
className="border rounded-xl p-3 w-full"
placeholder="Search users..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<div className="bg-white rounded-xl shadow overflow-auto">

<table className="w-full">

<thead className="bg-gray-100">
<tr>
<th className="p-4">Name</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>


<tbody>

{isLoading?
<tr><td className="p-5">Loading...</td></tr>
:
users.map(u=>

<tr className="border-t" key={u._id}>

<td className="p-4">{u.name}</td>

<td>{u.email}</td>

<td>
<span className="px-3 py-1 rounded-full bg-blue-100">
{u.role || "customer"}
</span>
</td>

<td>{u.status || "active"}</td>


<td className="space-x-2">

<button
className="border px-3 py-1 rounded"
onClick={()=>status(u._id,"active")}
>
Activate
</button>


<button
className="border px-3 py-1 rounded"
onClick={()=>status(u._id,"suspended")}
>
Suspend
</button>


<button
className="bg-red-500 text-white px-3 py-1 rounded"
onClick={()=>remove(u._id)}
>
Delete
</button>


</td>

</tr>

)}

</tbody>

</table>

</div>

</div>

}


function Card({title,value}){

return <div className="bg-white border rounded-xl p-5">

<p className="text-gray-500">{title}</p>

<h2 className="text-3xl font-bold">{value}</h2>

</div>

}