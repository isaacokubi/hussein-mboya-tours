import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


import {
  getAdminRoles,
  deleteAdminRole,
  toggleRoleStatus,
} from "../../../api/admin/adminRoleApi";



export default function AdminRoles(){


const queryClient = useQueryClient();



const {
  data,
  isLoading
}=useQuery({

  queryKey:["adminRoles"],

  queryFn:getAdminRoles

});





const deleteMutation = useMutation({

 mutationFn:deleteAdminRole,

 onSuccess(){

  queryClient.invalidateQueries([
    "adminRoles"
  ]);

 }

});





const statusMutation = useMutation({

 mutationFn:toggleRoleStatus,

 onSuccess(){

  queryClient.invalidateQueries([
    "adminRoles"
  ]);

 }

});





if(isLoading){

return (

<div className="p-6">

Loading roles...

</div>

);

}





const roles =
data?.data ||
data?.roles ||
[];





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
