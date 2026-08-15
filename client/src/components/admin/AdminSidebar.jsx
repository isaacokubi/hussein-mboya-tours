import {
  NavLink
} from "react-router-dom";


import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Wallet,
  Users,
  Car,
  Settings,
  PlusCircle,
  Edit,
  Smartphone,
  FileText,
  Home,
  Shield,
} from "lucide-react";


import {
  FaChartBar
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";




const AdminSidebar = () => {

const { hasPermission } = useAuth();






const menu = [


{
title:"Dashboard",

icon:<LayoutDashboard size={20}/>,

path:"/admin",

permission:"admin.dashboard"

},






{
title:"Tours",

icon:<Map size={20}/>,

permission:"tour.manage",

children:[


{
title:"Create Tour",

icon:<PlusCircle size={18}/>,

path:"/admin/tours/add"

},



{
title:"Manage Tours",

icon:<Edit size={18}/>,

path:"/admin/manage-tours"

}


]


},








{
title:"Bookings",

icon:<CalendarCheck size={20}/>,

path:"/admin/bookings",

permission:"booking.manage"

},







{
title:"Finance",

icon:<Wallet size={20}/>,

permission:"finance.view",

children:[


{
title:"Revenue",

icon:<Wallet size={18}/>,

path:"/admin/finance"

},


{
title:"M-Pesa Transactions",

icon:<Smartphone size={18}/>,

path:"/admin/finance/transactions"

},



{
title:"Reports",

icon:<FileText size={18}/>,

path:"/admin/finance/reports"

}



]


},








{
title:"Analytics",

icon:<FaChartBar size={20}/>,

path:"/admin/analytics",

permission:"analytics.view"

},






{
title:"Customers",

icon:<Users size={20}/>,

path:"/admin/customers",

permission:"customer.view"

},


{
title:"Custom Tour Requests",

icon:<FileText size={20}/>,

path:"/admin/custom-tour-requests",

permission:"customer.view"

},








{
title:"Guides",

icon:<Users size={20}/>,

path:"/admin/guides",

permission:"staff.manage"

},






{
title:"Vehicles",

icon:<Car size={20}/>,

path:"/admin/vehicles",

permission:"staff.manage"

},





// ============================================================
// RBAC
// ============================================================

{
title:"Roles & Permissions",

icon:<Shield size={20}/>,

path:"/admin/rbac",

permission:"roles.manage"

},






{
title:"Settings",

icon:<Settings size={20}/>,

path:"/admin/settings",

permission:"settings.manage"

},








{

title:"Website",

icon:<Home size={20}/>,

path:"/",

}

];









return (

<aside

className="
w-64
lg:w-72
bg-green-900
text-white
min-h-screen
p-5
shadow-xl
overflow-y-auto
"

>



<h2

className="
text-2xl
font-bold
mb-10
"

>

HUSSEIN TOURS

<br/>

<span
className="
text-sm
text-green-300
"
>

ADMIN PANEL

</span>


</h2>







<nav className="space-y-3">


{
menu.map((item,index)=>{


if(

item.permission &&

!hasPermission(item.permission)

)

return null;





return (

<div key={index}>


{

item.children ?



<div>


<div
className="
flex
items-center
gap-3
p-3
font-semibold
text-green-200
"
>

{item.icon}

<span>

{item.title}

</span>


</div>





<div
className="
ml-6
space-y-2
border-l
border-green-700
pl-3
"
>


{
item.children.map((child,i)=>(



<NavLink

key={i}

to={child.path}

className={({isActive})=>

`

flex
items-center
gap-3
p-2
rounded-lg
text-sm
transition-all


${

isActive

?

"bg-green-600 text-white"

:

"hover:bg-green-800 text-green-100"

}

`

}


>


{child.icon}

<span>

{child.title}

</span>


</NavLink>


))

}



</div>



</div>



:




<NavLink

to={item.path}

end={item.path==="/admin"}

className={({isActive})=>

`

flex
items-center
gap-3
p-3
rounded-lg
transition-all


${

isActive

?

"bg-green-600"

:

"hover:bg-green-800"

}

`

}


>


{item.icon}

<span>

{item.title}

</span>


</NavLink>



}



</div>


);



})

}



</nav>





</aside>


);



};


export default AdminSidebar;