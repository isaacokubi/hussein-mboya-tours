import {
    NavLink
} from "react-router-dom";


import {
    useAuth
} from "../../context/AuthContext";


import {
    iconMap
} from "./iconMap";






export default function AgentSidebar(){



const {
    user
}
=
useAuth();







const permissions =

user?.permissions ||

user?.role?.permissions ||

[];









const menu = permissions.map(permission=>{


return {

...permission,

icon:
iconMap[permission.icon]

};


});








return (

<aside

className="
w-64
bg-green-900
min-h-screen
text-white
p-5
overflow-y-auto
"

>







<h2

className="
text-xl
font-bold
mb-8
"

>

Coherent Tours

<br/>

<span
className="
text-sm
text-green-300
"
>

AGENT PORTAL

</span>


</h2>







<nav

className="
space-y-2
"

>






{
menu.length === 0 &&

<p
className="
text-green-200
text-sm
"
>

No available modules

</p>

}









{
menu.map((item)=>{





const Icon =
item.icon;







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
transition


${
isActive

?

"bg-white text-green-900"

:

"hover:bg-green-800 text-white"

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


);



})


}








</nav>







</aside>


);


}