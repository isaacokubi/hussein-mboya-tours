import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
getRoles,
getRole,
getPermissions,
updateRolePermissions
} from "../../api/superAdminApi";

export default function SuperAdminRoles() {

const {hasPermission}=useAuth();

if(!hasPermission("roles.manage")){
return (
<div className="p-8 text-red-600">
You do not have permission to manage roles.
</div>
);
}

const queryClient = useQueryClient();

const [selectedRole,setSelectedRole] = useState(null);
const [selectedPermissions,setSelectedPermissions] = useState([]);

const {data:roles=[]}=useQuery({
queryKey:["roles"],
queryFn:async()=>{
return await getRoles();
}
});


const {data:permissions=[]}=useQuery({
queryKey:["permissions"],
queryFn:async()=>{
return await getPermissions();
}
});


const updateRole=useMutation({

mutationFn:async()=>{

return updateRolePermissions(
selectedRole._id,
selectedPermissions
);

},

onSuccess: async ()=>{

await queryClient.invalidateQueries({
queryKey:["roles"]
});

const refreshed = await getRole(selectedRole._id);

setSelectedRole(refreshed);

setSelectedPermissions(
(refreshed.permissions || []).map(
p => typeof p === "object" ? p._id : p
)
);

alert(
"Role permissions updated successfully"
);

},

onError:(error)=>{

console.error(
"ROLE UPDATE ERROR:",
error?.response?.data || error
);

alert(
error?.response?.data?.message ||
"Unable to update permissions"
);

}

});


const openRole=async(role)=>{

try{

const fullRole =
await getRole(role._id);


setSelectedRole(fullRole);


setSelectedPermissions(
(fullRole.permissions || [])
.map(
p =>
typeof p === "object"
?
p._id
:
p
)
);


}catch(error){

console.error(
"LOAD ROLE ERROR:",
error
);

alert(
"Unable to load role details"
);

}

};


const togglePermission=(id)=>{

setSelectedPermissions(prev=>
prev.includes(id)
?
prev.filter(x=>x!==id)
:
[...prev,id]
);

};


return (

<div className="p-8 space-y-6">


<h1 className="text-3xl font-bold">
Roles & Permissions Center
</h1>


<div className="grid lg:grid-cols-3 gap-6">


<div className="bg-white border rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
System Roles
</h2>


{roles.map(role=>(

<button
key={role._id}
onClick={()=>openRole(role)}
className="w-full text-left border rounded-lg p-4 mb-3 hover:bg-gray-50"
>


<h3 className="font-bold">
{role.displayName || role.name}
</h3>


<p>
Level: {role.level}
</p>


<p>
Permissions: {role.permissions?.length || 0}
</p>


</button>

))}

</div>



<div className="lg:col-span-2 bg-white border rounded-xl p-6">


{
selectedRole ?

<>

<h2 className="text-xl font-bold mb-4">
Edit {selectedRole.displayName || selectedRole.name}
</h2>


<div className="grid md:grid-cols-2 gap-3">


{permissions.map(permission=>(

<label
key={permission._id}
className="border rounded p-3 flex gap-3"
>


<input
type="checkbox"
checked={selectedPermissions.includes(permission._id)}
onChange={()=>togglePermission(permission._id)}
/>


<span>
{permission.name}
</span>


</label>

))}


</div>


<button
onClick={()=>updateRole.mutate()}
disabled={updateRole.isPending}
className="mt-6 bg-black text-white px-6 py-3 rounded"
>

{
updateRole.isPending
?
"Saving..."
:
"Save Permissions"
}

</button>


</>


:


<div className="text-gray-500">
Select a role to edit permissions
</div>


}


</div>


</div>


</div>

);

}
