import {
Link
}
from "react-router-dom";


export default function AdminLayout({
children
}){


return (

<div
className="
min-h-screen
flex
bg-gray-100
"
>


<aside
className="
w-64
bg-black
text-white
p-6
"
>


<h1
className="
text-xl
font-bold
mb-8
"
>

Hussein Admin

</h1>


<nav
className="
space-y-4
"
>


<Link
to="/admin"
>
Dashboard
</Link>


<Link
to="/admin/bookings"
>
Bookings
</Link>


<Link
to="/admin/tours"
>
Tours
</Link>


<Link
to="/admin/users"
>
Users
</Link>


</nav>


</aside>



<main
className="
flex-1
p-8
"
>

{children}

</main>


</div>

);

}