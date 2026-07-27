import {
Link
}
from "react-router-dom";


import iconMap from "../../config/iconMap";


import {
useAuth
}
from "../../context/AuthContext";



export default function AgentSidebar(){


const {
user
}
=
useAuth();



const permissions =
user?.permissions || [];




const menu =
permissions.map(permission=>{


return {


name:permission.label,


path:permission.path,


icon:
iconMap[permission.icon]


};


});





return (

<aside className="
w-64
bg-white
shadow
min-h-screen
p-5
">


<h2 className="
font-bold
text-xl
mb-6
">

Hussein Mboya Tours

</h2>



<nav>


{
menu.map((item)=>{


const Icon=item.icon;


return (

<Link

key={item.path}

to={item.path}

className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-gray-100
"


>


<Icon size={20}/>


<span>

{item.name}

</span>


</Link>


)


})
}


</nav>


</aside>

)


}