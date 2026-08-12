
import React,{useEffect,useState} from "react";
import {
getRoles
} from "../../api/admin/adminRoleApi";


export default function SuperAdminRoles(){

const [roles,setRoles]=useState([]);


useEffect(()=>{


getRoles()
.then(
data=>
setRoles(
data.roles ||
data ||
[]
)
)
.catch(
()=>setRoles([])
);


},[]);



return (

<section className="space-y-6">


<div>

<h1 className="text-3xl font-bold">
Roles & Permissions
</h1>

<p className="text-gray-500">
Manage platform access control
</p>

</div>



<div className="
grid
md:grid-cols-3
gap-5
">


{
roles.length
?
roles.map(role=>(

<div
key={role._id}
className="
bg-white
rounded-xl
shadow
p-6
"
>


<h2 className="
text-xl
font-bold
mb-3
">

{
role.name ||
role.displayName
}

</h2>



<div className="flex flex-wrap gap-2">


{
(role.permissions||[])
.map(
p=>(

<span

key={
p._id || p.name
}

className="
bg-blue-100
px-3
py-1
rounded-full
text-sm
"

>

{
p.name ||
p
}

</span>


)

)

}


</div>


</div>


))
:

<div className="
bg-white
p-6
rounded-xl
"
>

No roles found

</div>

}


</div>



</section>

)

}
