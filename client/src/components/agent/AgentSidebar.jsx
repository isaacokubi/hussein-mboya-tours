import {
NavLink
} from "react-router-dom";


import {
useAuth
}
from "../../context/AuthContext";


import {
iconMap
}
from "./iconMap";



export default function AgentSidebar(){


const {
user
}=useAuth();



const permissions =
user?.permissions || [];



return (

<aside
className="
w-64
bg-green-900
min-h-screen
text-white
p-5
"
>


<h2 className="
text-xl
font-bold
mb-8
">

Hussein Mboya Tours

</h2>



<nav
className="space-y-2"
>


{

permissions.map((item)=>{


const Icon =
iconMap[item.icon];


return (

<NavLink

key={item.path}

to={item.path}

className={({isActive})=>

`
flex
items-center
gap-3
p-3
rounded-lg

${
isActive
?
"bg-white text-green-900"
:
"hover:bg-green-800"
}

`

}


>


{
Icon &&
<Icon size={20}/>
}


<span>
{item.label}
</span>


</NavLink>


)


})


}


</nav>


</aside>


)

}