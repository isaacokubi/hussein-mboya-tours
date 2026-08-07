import {
    Outlet
}
from "react-router-dom";


import AdminSidebar
from "../../components/admin/AdminSidebar";


import AdminHeader
from "../../components/admin/AdminHeader";




export default function AdminLayout(){


return (

<div
className="
flex
min-h-screen
bg-gray-100
"
>





{/* SIDEBAR */}

<AdminSidebar/>







{/* MAIN AREA */}

<div
className="
flex-1
flex
flex-col
"
>





{/* HEADER */}

<AdminHeader/>







{/* PAGE CONTENT */}

<main

className="
flex-1
p-8
overflow-y-auto
"

>


<Outlet/>


</main>




</div>






</div>


);


}