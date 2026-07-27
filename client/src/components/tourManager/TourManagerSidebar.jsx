import React from "react";

import {
  LayoutDashboard,
  Map,
  Calendar,
  Users,
  UserRoundCheck,
  Car,
  FileText,
  Wallet,
  Settings,
  BarChart3
} from "lucide-react";


import { NavLink } from "react-router-dom";



const TourManagerSidebar = () => {



const menu = [


{
name:"Dashboard",
icon:<LayoutDashboard size={20}/>,
path:"/tour-manager/dashboard"
},



{
name:"Tours",
icon:<Map size={20}/>,
path:"/tour-manager/tours"
},



{
name:"Calendar",
icon:<Calendar size={20}/>,
path:"/tour-manager/calendar"
},



{
name:"Bookings",
icon:<FileText size={20}/>,
path:"/tour-manager/bookings"
},



{
name:"Customers",
icon:<Users size={20}/>,
path:"/tour-manager/customers"
},



{
name:"Guides",
icon:<UserRoundCheck size={20}/>,
path:"/tour-manager/guides"
},



{
name:"Vehicles",
icon:<Car size={20}/>,
path:"/tour-manager/vehicles"
},



{
name:"Reports",
icon:<Wallet size={20}/>,
path:"/tour-manager/reports"
},



{
name:"Analytics",
icon:<BarChart3 size={20}/>,
path:"/tour-manager/analytics"
},



{
name:"Settings",
icon:<Settings size={20}/>,
path:"/tour-manager/settings"
}



];





return (

<aside

className="
w-72
min-h-screen
bg-green-900
text-white
p-5
"

>


<h2

className="
text-2xl
font-bold
mb-10
"

>

Hussein Mboya

<br/>

<span

className="
text-yellow-400
"

>
Tours
</span>


</h2>





<nav

className="
space-y-3
"

>


{

menu.map((item)=>(


<NavLink

key={item.name}

to={item.path}

className={({isActive})=>

`

flex
items-center
gap-4
p-3
rounded-lg
transition

${
isActive
?
"bg-green-600 shadow-lg"
:
"hover:bg-green-700"
}

`

}

>


{item.icon}


<span>

{item.name}

</span>



</NavLink>


))

}



</nav>



</aside>


);


};



export default TourManagerSidebar;