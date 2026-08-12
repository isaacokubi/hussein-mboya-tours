import { useState } from "react";

import {Outlet} from "react-router-dom";
import {Menu,Bell} from "lucide-react";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";


export default function SuperAdminLayout(){

const [open,setOpen]=useState(false);


return (

<div
className="
min-h-screen
bg-gray-100
"
>


<SuperAdminSidebar
open={open}
setOpen={setOpen}
/>


<div
className="
md:ml-72
"
>


<header
className="
h-16
bg-white
shadow
flex
items-center
justify-between
px-5
"
>


<button
className="md:hidden"
onClick={()=>setOpen(true)}
>
<Menu/>
</button>



<div>

<h2 className="font-bold">
Super Admin Control Center
</h2>

<p className="text-xs text-gray-500">
Platform Governance
</p>

</div>



<Bell className="text-gray-600"/>


</header>



<main
className="
p-4
md:p-8
"
>

<Outlet/>

</main>


</div>


</div>

)

}
