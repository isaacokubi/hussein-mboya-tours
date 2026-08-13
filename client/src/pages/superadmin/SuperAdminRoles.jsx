import {useQuery} from "@tanstack/react-query";
import api from "../../api/axios";


export default function SuperAdminRoles(){

const {data:roles}=useQuery({
queryKey:["roles"],
queryFn:async()=>{
const r=await api.get("/admin/roles");
return r.data.roles || [];
}
});


const {data:permissions}=useQuery({
queryKey:["permissions"],
queryFn:async()=>{
const r=await api.get("/admin/roles/permissions/all");
return r.data.permissions || [];
}
});


return <div className="p-8 space-y-6">


<h1 className="text-3xl font-bold">
Roles & Permissions Center
</h1>


<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white rounded-xl border p-6">

<h2 className="font-bold text-xl mb-4">
System Roles
</h2>

{
roles?.map(r=>

<div key={r._id}
className="border rounded-lg p-4 mb-3">

<h3 className="font-bold">
{r.displayName || r.name}
</h3>

<p>
Level: {r.level}
</p>

<p>
Permissions: {r.permissions?.length || 0}
</p>

</div>

)
}


</div>


<div className="bg-white rounded-xl border p-6">

<h2 className="font-bold text-xl mb-4">
Available Permissions
</h2>

{
permissions?.map(p=>

<div key={p._id}
className="border p-3 rounded mb-2">

{p.name}

</div>

)
}

</div>


</div>

</div>

}