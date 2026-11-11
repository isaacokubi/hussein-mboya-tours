/**
 * Purpose: Admin Roles page-level UI component. Main declarations: AdminRoles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


// Load ../../../api/admin/adminRoleApi so this module can use its exported dependencies.
import {
  getAdminRoles,
  deleteAdminRole,
  toggleRoleStatus,
} from "../../../api/admin/adminRoleApi";



// Define AdminRoles; its parameters and body implement this operation.
export default function AdminRoles(){


// Declare queryClient for use by the surrounding module or function.
const queryClient = useQueryClient();



// Declare { data, isLoading } for use by the surrounding module or function.
const {
  data,
  isLoading
}=useQuery({

  queryKey:["adminRoles"],

  queryFn:getAdminRoles

});





// Declare deleteMutation for use by the surrounding module or function.
const deleteMutation = useMutation({

 mutationFn:deleteAdminRole,

 // Implement the onSuccess method for this class.
 onSuccess(){

  // Perform the side effect or state update expressed on the following line.
  queryClient.invalidateQueries([
    "adminRoles"
  ]);

 }

});





// Declare statusMutation for use by the surrounding module or function.
const statusMutation = useMutation({

 mutationFn:toggleRoleStatus,

 // Implement the onSuccess method for this class.
 onSuccess(){

  // Perform the side effect or state update expressed on the following line.
  queryClient.invalidateQueries([
    "adminRoles"
  ]);

 }

});





// Check the condition (isLoading) and run the matching branch.
if(isLoading){

// Return the expression shown below to the caller.
return (

<div className="p-6">

Loading roles...

</div>

);

}





// Declare roles for use by the surrounding module or function.
const roles =
data?.data ||
data?.roles ||
[];





// Return the expression shown below to the caller.
return (

<div className="p-6 space-y-6">


<div className="flex justify-between items-center">


<h1 className="text-3xl font-bold">

Role Management

</h1>


<button
className="
bg-blue-600
text-white
px-5
py-2
rounded-lg
"
>

Create Role

</button>


</div>





<div
className="
bg-white
rounded-xl
shadow
overflow-hidden
"
>


<table className="w-full">


<thead
className="
bg-gray-100
"
>

<tr>

<th className="p-3 text-left">
Name
</th>

<th className="p-3 text-left">
Level
</th>


<th className="p-3 text-left">
Status
</th>


<th className="p-3">
Actions
</th>


</tr>


</thead>



<tbody>


{
roles.map((role)=>(


<tr
key={role._id}
className="border-b"
>


<td className="p-3">

{role.name}

</td>



<td className="p-3">

{role.level}

</td>



<td className="p-3">

<span
className="
px-3
py-1
rounded-full
bg-gray-100
"
>

{role.status}

</span>

</td>




<td className="p-3 space-x-2">


<button

onClick={()=>


statusMutation.mutate({

id:role._id,

payload:{

status:
role.status==="active"
?"inactive"
:"active"

}

})

}


className="
bg-yellow-500
text-white
px-3
py-1
rounded
"

>

Toggle

</button>




<button

disabled={role.isSystem}

onClick={()=>deleteMutation.mutate(role._id)}

className="
bg-red-600
text-white
px-3
py-1
rounded
disabled:opacity-50
"

>

Delete

</button>



</td>



</tr>


))

}



</tbody>


</table>


</div>



</div>


);


}
