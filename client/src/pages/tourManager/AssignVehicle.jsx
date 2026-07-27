import React,{
useEffect,
useState
}
from "react";


import {

useParams,

useNavigate

}

from "react-router-dom";



import {

toast

}

from "react-toastify";



import {

getVehicles,

assignVehicle,

getTour

}

from "../../api/tourApi";






const AssignVehicle =()=>{


const {
id
}
=
useParams();



const navigate =
useNavigate();




const [
vehicles,
setVehicles
]
=
useState([]);




const [
tour,
setTour
]
=
useState(null);




const [
vehicle,
setVehicle
]
=
useState("");







useEffect(()=>{


const loadData =
async()=>{


try{


const [

vehicleResponse,

tourResponse

]

=
await Promise.all([


getVehicles(),


getTour(id)


]);




setVehicles(

vehicleResponse.data.vehicles

);




setTour(

tourResponse.data.tour

);



setVehicle(

tourResponse.data.tour.vehicle?._id
||
""

);



}

catch(error){


toast.error(
"Failed loading vehicles"
);


}



};



loadData();



},[id]);









const saveVehicle =
async()=>{


try{


await assignVehicle(

id,

vehicle

);



toast.success(

"Vehicle assigned successfully"

);



navigate(
"/tour-manager/tours"
);



}

catch(error){


toast.error(
"Assignment failed"
);


}



};








return (

<div
className="
min-h-screen
bg-gray-100
p-6
"
>



<div
className="
max-w-xl
mx-auto
bg-white
shadow
rounded-xl
p-8
"
>


<h1
className="
text-2xl
font-bold
mb-5
"
>

Assign Vehicle

</h1>




{

tour &&

<p
className="
mb-5
text-gray-600
"
>

Tour:

<strong>

{tour.title}

</strong>

</p>

}







<select

value={vehicle}

onChange={
e=>setVehicle(e.target.value)
}

className="
border
rounded-lg
p-3
w-full
"

>


<option value="">

Select Vehicle

</option>



{

vehicles.map(

item=>(


<option

key={item._id}

value={item._id}

>

{item.name}

-

{item.registration}

(
{item.type}
)

</option>


)

)

}



</select>








<button

onClick={saveVehicle}

className="
mt-6
w-full
bg-purple-600
text-white
py-3
rounded-lg
"

>

Assign Vehicle

</button>




</div>


</div>


);


};


export default AssignVehicle;