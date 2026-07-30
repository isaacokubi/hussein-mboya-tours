import {
Outlet
}
from "react-router-dom";


import AdminSidebar
from "../../components/admin/AdminSidebar";


export default function AdminLayout(){


return (

<div className="
flex
">


<AdminSidebar/>


<main className="
flex-1
bg-gray-100
min-h-screen
p-8
">


<Outlet/>


</main>



</div>

)

}