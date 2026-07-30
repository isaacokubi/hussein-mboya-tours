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

getTourAvailability,

updateTourAvailability

}

from "../../api/tourApi";






const TourAvailability =()=>{


const {

id

}
=
useParams();



const navigate =
useNavigate();




const [
availability,
setAvailability
]
=
useState({

totalSlots:0,

bookedSlots:0,

availableSlots:0

});





const [
capacity,
setCapacity
]
=
useState("");









useEffect(()=>{


const load = async()=>{


try{


const response =

await getTourAvailability(id);



setAvailability(

response.data.availability

);



setCapacity(

response.data.availability.totalSlots

);



}

catch(error){


toast.error(
"Unable to load availability"
);


}



};



load();



},[id]);










const save = async()=>{


try{


await updateTourAvailability(

id,

{

totalSlots:Number(capacity)

}

);



toast.success(
"Availability updated"
);



navigate(
"/tour-manager/tours"
);



}

catch(error){


toast.error(
"Update failed"
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
rounded-xl
shadow
p-8
"
>


<h1
className="
text-2xl
font-bold
mb-6
"
>

Tour Availability

</h1>






<div
className="
space-y-4
"
>



<div
className="
bg-blue-50
p-4
rounded-lg
"
>

<p>
Total Slots
</p>

<h2
className="
text-3xl
font-bold
"
>

{availability.totalSlots}

</h2>

</div>






<div
className="
bg-red-50
p-4
rounded-lg
"
>

<p>
Booked Slots
</p>

<h2
className="
text-3xl
font-bold
"
>

{availability.bookedSlots}

</h2>

</div>







<div
className="
bg-green-50
p-4
rounded-lg
"
>

<p>
Available Slots
</p>

<h2
className="
text-3xl
font-bold
"
>

{availability.availableSlots}

</h2>

</div>







<input

type="number"

value={capacity}

onChange={(e)=>
setCapacity(e.target.value)
}

className="
border
rounded-lg
p-3
w-full
"

/>






<button

onClick={save}

className="
w-full
bg-orange-600
text-white
py-3
rounded-lg
"

>

Update Capacity

</button>




</div>


</div>


</div>

);


};


export default TourAvailability;