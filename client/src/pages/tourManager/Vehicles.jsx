import React from "react";


import {
    FaCar,
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";


import {
    toast
} from "react-toastify";


import useVehicles
from "../../hooks/useVehicles";


import {
    deleteVehicle
} from "../../api/vehicleApi";







export default function Vehicles(){


const {
    data:vehicles=[],
    isLoading,
    refetch
}
=
useVehicles();







const removeVehicle = async(id)=>{


if(
!window.confirm(
"Remove this vehicle?"
)

)

return;





try{


await deleteVehicle(id);



toast.success(
"Vehicle removed"
);



refetch();


}

catch(error){


toast.error(
"Delete failed"
);


}


};









return (

<div className="
min-h-screen
bg-gray-100
p-6
">






{/* HEADER */}



<div className="
flex
justify-between
items-center
mb-8
">


<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

Vehicles Management

</h1>



<p className="
text-gray-500
">

Manage tour transport vehicles

</p>


</div>








<button

className="
bg-orange-600
text-white
px-5
py-3
rounded-lg
flex
items-center
gap-2
"

>


<FaPlus/>

Add Vehicle


</button>



</div>









<div className="
bg-white
rounded-xl
shadow
p-6
">


{

isLoading


?


<p>

Loading vehicles...

</p>



:


vehicles.length === 0


?


<p className="
text-gray-500
">

No vehicles available

</p>




:


<div className="
grid
md:grid-cols-3
gap-6
">


{

vehicles.map(vehicle=>(



<div

key={vehicle._id}

className="
border
rounded-xl
p-5
bg-white
"

>





<div className="
flex
items-center
gap-3
mb-4
">


<FaCar

className="
text-orange-600
text-2xl
"

/>



<h2 className="
font-bold
text-lg
">

{vehicle.name}

</h2>



</div>







<p>

Registration:

<span className="
font-semibold
ml-1
">

{

vehicle.registrationNumber ||

"N/A"

}

</span>

</p>






<p>

Type:

<span className="
font-semibold
ml-1
">

{

vehicle.type ||

"N/A"

}

</span>


</p>







<p>

Capacity:

<span className="
font-semibold
ml-1
">

{

vehicle.capacity ||

0

}

</span>


</p>







<p>

Driver:

<span className="
font-semibold
ml-1
">

{

vehicle.driver?.name ||

"No driver"

}

</span>


</p>









<span className="
inline-block
mt-3
bg-green-100
text-green-700
px-3
py-1
rounded-full
text-sm
">

{

vehicle.status ||

"Available"

}

</span>







<div className="
flex
gap-3
mt-5
">


<button

className="
text-blue-600
"

>

<FaEdit/>

</button>






<button

onClick={()=>removeVehicle(
vehicle._id
)}

className="
text-red-600
"

>

<FaTrash/>

</button>



</div>






</div>



))


}



</div>



}



</div>







</div>

);


}