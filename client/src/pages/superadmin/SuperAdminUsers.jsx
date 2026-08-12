
import React,{useEffect,useState} from "react";
import {
getAdminUsers,
updateUserStatus,
deleteUser
} from "../../api/adminUserApi";


export default function SuperAdminUsers(){

const [users,setUsers]=useState([]);
const [search,setSearch]=useState("");
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");


const loadUsers=async()=>{

try{

setLoading(true);

const data=await getAdminUsers({
search
});

setUsers(
data.users ||
data.data ||
data ||
[]
);

}
catch(e){

setError(
"Failed loading users"
);

}

finally{

setLoading(false);

}

};


useEffect(()=>{

loadUsers();

},[]);



const changeStatus=async(id,status)=>{

await updateUserStatus({
id,
status
});

loadUsers();

};


const remove=async(id)=>{

if(
window.confirm(
"Delete this user?"
)
){

await deleteUser(id);

loadUsers();

}

};



return (

<section className="space-y-6">


<div>

<h1 className="text-3xl font-bold">
User Administration
</h1>


<p className="text-gray-500">
Manage all platform users, staff and customers
</p>


</div>



<div className="bg-white rounded-xl shadow p-5">


<input

className="
border
rounded-lg
p-3
w-full
"

placeholder="Search users..."

value={search}

onChange={
e=>setSearch(e.target.value)
}

onKeyDown={
e=>{
if(e.key==="Enter")
loadUsers()
}
}

/>


</div>



{
loading
?
<p>Loading users...</p>
:
error
?
<p>{error}</p>
:


<div className="
bg-white
rounded-xl
shadow
overflow-x-auto
">


<table className="
w-full
text-left
">


<thead
className="
bg-gray-100
"
>

<tr>

<th className="p-4">
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
className="border-t"
>


<td className="p-4">
{user.name}
</td>


<td className="p-4">
{user.email}
</td>


<td className="p-4">
<span className="
bg-blue-100
px-3
py-1
rounded-full
text-sm
">

{
user.role ||
user.roleId?.name ||
"customer"
}

</span>
</td>


<td className="p-4">

{
user.status ||
"active"
}

</td>


<td className="p-4 space-x-2">


<button

className="
px-3
py-2
bg-green-600
text-white
rounded
"

onClick={()=>
changeStatus(
user._id,
"active"
)
}

>
Activate
</button>



<button

className="
px-3
py-2
bg-red-600
text-white
rounded
"

onClick={()=>
changeStatus(
user._id,
"suspended"
)
}

>
Suspend
</button>



<button

className="
px-3
py-2
bg-gray-800
text-white
rounded
"

onClick={()=>
remove(user._id)
}

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


}


</section>

)

}
