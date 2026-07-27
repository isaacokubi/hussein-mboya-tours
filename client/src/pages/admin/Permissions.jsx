import React,{useEffect,useState} from "react";
import {
getRoles,
updateRolePermissions
}
from "../../api/adminApi";


const Permissions=()=>{


const [roles,setRoles]=useState([]);



useEffect(()=>{

getRoles()
.then(res=>
setRoles(res.data)
);

},[]);



const permissions=[

"manage_tours",
"create_tours",
"update_tours",
"manage_bookings",
"assign_guides",
"view_customers",
"view_reports",
"manage_itineraries",
"manage_vehicles",
"manage_payments"

];



return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-6
">
Role Permissions
</h1>



<div className="
grid
md:grid-cols-2
gap-6
">


{
roles.map(role=>(


<div
key={role._id}
className="
bg-white
shadow
rounded-xl
p-6
"
>


<h2 className="
text-xl
font-bold
mb-4
">
{role.name}
</h2>



{
permissions.map(permission=>(


<label
key={permission}
className="
flex
gap-3
mb-3
"
>


<input
type="checkbox"
/>


<span>
{permission}
</span>


</label>


))
}



<button
className="
bg-green-700
text-white
px-5
py-2
rounded
"
>
Save Permissions
</button>


</div>


))
}



</div>


</div>

)

}


export default Permissions;