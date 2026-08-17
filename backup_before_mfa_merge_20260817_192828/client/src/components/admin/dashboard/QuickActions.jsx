import {
Link
} from "react-router-dom";


const actions=[

{
name:"Create Tour",
path:"/admin/tours/add"
},

{
name:"Manage Users",
path:"/admin/users"
},

{
name:"View Bookings",
path:"/admin/bookings"
},

{
name:"Reports",
path:"/admin/reports"
}

];



export default function QuickActions(){


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
font-bold
text-xl
mb-4
">

Quick Actions

</h2>



<div className="
grid
md:grid-cols-4
gap-4
">


{

actions.map(action=>(


<Link

key={action.name}

to={action.path}

className="
border
rounded-lg
p-4
hover:bg-gray-100
"

>


{action.name}


</Link>


))

}


</div>


</div>

);


}