import React, { useState } from "react";

import {
  Menu,
  X
} from "lucide-react";


import TourManagerSidebar 
from "../components/tourManager/TourManagerSidebar";

import { Outlet } from "react-router-dom";



const TourManagerLayout = () => {


const [mobileOpen,setMobileOpen] = useState(false);



return (

<div className="min-h-screen bg-gray-100 flex">



{/* =====================================================
    DESKTOP SIDEBAR
===================================================== */}


<div
className="
hidden
lg:block
w-72
"
>

<TourManagerSidebar />

</div>







{/* =====================================================
    MOBILE SIDEBAR OVERLAY
===================================================== */}


{

mobileOpen && (

<div

className="
fixed
inset-0
z-50
lg:hidden
"

>


<div

className="
absolute
inset-0
bg-black
opacity-50
"

onClick={()=>setMobileOpen(false)}

></div>




<div

className="
relative
w-72
h-full
"

>


<TourManagerSidebar />



<button

onClick={()=>setMobileOpen(false)}

className="
absolute
top-4
right-4
bg-white
text-green-900
p-2
rounded-full
"

>

<X size={22}/>

</button>



</div>



</div>


)

}







{/* =====================================================
    MAIN CONTENT
===================================================== */}


<div
className="
flex-1
"
>





{/* MOBILE HEADER */}

<div

className="
lg:hidden
flex
items-center
gap-4
bg-green-900
p-4
"

>


<button

onClick={()=>setMobileOpen(true)}

className="
p-3
bg-green-700
text-white
rounded
"

>

<Menu size={25}/>

</button>




<h1

className="
text-white
text-xl
font-bold
"

>

Dashboard

</h1>



</div>







{/* PAGE CONTENT */}

<main

className="
p-6
"

>

<Outlet />

</main>





</div>




</div>

)

};



export default TourManagerLayout;