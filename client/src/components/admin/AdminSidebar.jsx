import {Link} from "react-router-dom";

import {
FaHome,
FaPlane,
FaCalendar,
FaChartBar
}
from "react-icons/fa";


export default function AdminSidebar(){


return (

<aside className="
w-64
bg-green-800
text-white
min-h-screen
p-6
">


<h2 className="
text-2xl
font-bold
mb-10
">

Hussein Tours

</h2>



<nav className="
space-y-5
">


<Link
to="/admin"
className="flex gap-3"
>

<FaChartBar/>

Dashboard

</Link>



<Link
to="/admin/tours"
className="flex gap-3"
>

<FaPlane/>

Tours

</Link>



<Link
to="/admin/bookings"
className="flex gap-3"
>

<FaCalendar/>

Bookings

</Link>



<Link
to="/"
className="flex gap-3"
>

<FaHome/>

Website

</Link>



</nav>



</aside>

)

}