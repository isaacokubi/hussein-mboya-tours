import {
useState
} from "react";


import {
useQuery,
useMutation,
useQueryClient
} from "@tanstack/react-query";


import {
Search,
Trash2,
UserCheck,
UserX
} from "lucide-react";


import {
toast
} from "react-toastify";


import {
getAdminUsers,
updateUserStatus,
deleteUser
} from "../../api/adminUserApi";






export default function UserManagement(){



const queryClient =
useQueryClient();



const [search,setSearch]=useState("");




const {

data,
isLoading

}=useQuery({

queryKey:[
"admin-users",
search
],

queryFn:()=>getAdminUsers({

search

})


});







const users =

data?.data ||

data?.users ||

[];








const statusMutation=

useMutation({

mutationFn:
({id,status})=>
updateUserStatus(id,status),



onSuccess(){

toast.success(
"User updated"
);


queryClient.invalidateQueries([
"admin-users"
]);


}

});








const deleteMutation=

useMutation({

mutationFn:
deleteUser,


onSuccess(){

toast.success(
"User deleted"
);


queryClient.invalidateQueries([
"admin-users"
]);

}

});









if(isLoading)

return (

<div>

Loading users...

</div>

);









return (

<div className="
space-y-6
">






<h1 className="
text-3xl
font-bold
">

User Management

</h1>







{/* SEARCH */}



<div className="
bg-white
p-4
rounded-xl
shadow
flex
items-center
gap-3
">


<Search/>


<input

value={search}

onChange={
e=>setSearch(e.target.value)
}

placeholder="
Search users...
"

className="
border
rounded-lg
p-3
w-full
"

/>


</div>









{/* TABLE */}



<div className="
bg-white
rounded-xl
shadow
overflow-x-auto
">


<table className="
w-full
">


<thead
className="
bg-gray-100
"
>

<tr>


<th className="p-4 text-left">
Name
</th>


<th className="p-4">
Email
</th>


<th className="p-4">
Role
</th>


<th className="p-4">
Status
</th>


<th className="p-4">
Actions
</th>


</tr>


</thead>







<tbody>



{

users.map(user=>(



<tr

key={user._id}

className="
border-b
"

>


<td className="p-4">

{
user.name
}

</td>


<td className="p-4">

{
user.email
}

</td>



<td className="p-4 capitalize">

{
user.role
}

</td>





<td className="p-4">


{

user.isActive

?


<span className="
text-green-600
">

Active

</span>


:

<span className="
text-red-600
">

Disabled

</span>


}



</td>







<td className="
p-4
flex
gap-3
">






<button

onClick={()=>


statusMutation.mutate({

id:user._id,

status:
user.isActive
?
false
:
true


})


}


className="
p-2
rounded
bg-gray-100
"


>


{

user.isActive

?

<UserX size={18}/>

:

<UserCheck size={18}/>

}


</button>









<button

onClick={()=>{


if(
confirm(
"Delete this user?"
)

)

deleteMutation.mutate(
user._id
);


}}


className="
p-2
bg-red-100
rounded
text-red-600
"

>


<Trash2 size={18}/>


</button>








</td>





</tr>



))


}




</tbody>



</table>


</div>








</div>

)


}