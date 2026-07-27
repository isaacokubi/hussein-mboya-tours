import {
NavLink
}
from "react-router-dom";


import {
iconMap
}
from "../config/sidebar";


export default function AgentSidebar({

permissions=[]

}){


const menu = permissions
.filter(
permission=>permission.active !== false
)
.map(permission=>({

...permission,

icon:
iconMap[permission.icon]

}));



return (

<div>


{
menu.map(item=>{


const Icon=item.icon;


return (

<NavLink

key={item.name}

to={item.path}

className="flex items-center gap-3 p-3"

>


{
Icon && <Icon size={20}/>
}


<span>
{item.label}
</span>


</NavLink>

)


})

}



</div>

)


}