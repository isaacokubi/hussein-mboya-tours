import {
    Outlet,
    NavLink
} from "react-router-dom";


import {
    LayoutDashboard,
    Users,
    Map,
    CalendarCheck,
    Wallet,
    UserCog,
    Car,
    FileText,
    Star,
    Image,
    Settings,
    BarChart3,
    Tag,
    Bell,
    Bot
} from "lucide-react";




const menu=[


{
name:"Dashboard",
path:"/admin",
icon:<LayoutDashboard/>
},


{
name:"Users",
path:"/admin/users",
icon:<Users/>
},


{
name:"Staff",
path:"/admin/staff",
icon:<UserCog/>
},


{
name:"Tours",
path:"/admin/manage-tours",
icon:<Map/>
},


{
name:"Destinations",
path:"/admin/destinations",
icon:<Map/>
},


{
name:"Bookings",
path:"/admin/bookings",
icon:<CalendarCheck/>
},


{
name:"Payments",
path:"/admin/payments",
icon:<Wallet/>
},


{
name:"Agents",
path:"/admin/agents",
icon:<Users/>
},


{
name:"Customers CRM",
path:"/admin/customers",
icon:<Users/>
},


{
name:"Guides",
path:"/admin/guides",
icon:<UserCog/>
},


{
name:"Vehicles",
path:"/admin/vehicles",
icon:<Car/>
},


{
name:"Coupons",
path:"/admin/coupons",
icon:<Tag/>
},


{
name:"Reviews",
path:"/admin/reviews",
icon:<Star/>
},


{
name:"Gallery",
path:"/admin/gallery",
icon:<Image/>
},


{
name:"Reports",
path:"/admin/reports",
icon:<BarChart3/>
},


{
name:"Analytics",
path:"/admin/analytics",
icon:<BarChart3/>
},


{
name:"AI Tools",
path:"/admin/ai",
icon:<Bot/>
},


{
name:"Notifications",
path:"/admin/notifications",
icon:<Bell/>
},


{
name:"Settings",
path:"/admin/settings",
icon:<Settings/>
}



];








export default function AdminLayout(){



return (

<div className="
min-h-screen
flex
bg-gray-100
">





{/* SIDEBAR */}


<aside className="
w-72
bg-gray-900
text-white
p-5
hidden
md:block
">


<h1 className="
text-xl
font-bold
mb-8
">

Coherent Tours

</h1>





<nav className="
space-y-2
">


{

menu.map(item=>(


<NavLink

key={item.path}

to={item.path}

end={item.path==="/admin"}

className={({isActive})=>

`
flex
items-center
gap-3
px-4
py-3
rounded-lg

${
isActive
?
"bg-white text-black"
:
"hover:bg-gray-800"
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









{/* MAIN CONTENT */}



<main className="
flex-1
p-6
overflow-x-hidden
">


<Outlet/>


</main>




</div>


);


}