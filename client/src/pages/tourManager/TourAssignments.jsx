import {
useEffect,
useState
} from "react";


import {

getTours,

getGuides,

getDrivers,

getVehicles,

assignTour

}
from "../../api/tourAssignmentApi";





export default function TourAssignments(){


const [tours,setTours]=useState([]);

const [guides,setGuides]=useState([]);

const [drivers,setDrivers]=useState([]);

const [vehicles,setVehicles]=useState([]);





const loadData = async()=>{


const [

tourRes,

guideRes,

driverRes,

vehicleRes

]=await Promise.all([


getTours(),

getGuides(),

getDrivers(),

getVehicles()


]);



setTours(
tourRes.data.tours
||
tourRes.data
);



setGuides(
guideRes.data.staff
||
[]
);



setDrivers(
driverRes.data.staff
||
[]
);



setVehicles(
vehicleRes.data.vehicles
||
[]
);



};







useEffect(()=>{


loadData();


},[]);







const handleAssign = async(

tourId,

guideId,

driverId,

vehicleId

)=>{


await assignTour(

tourId,

{

guideId,

driverId,

vehicleId

}

);



alert(
"Tour assigned successfully"
);



loadData();


};






return (

<div className="p-6">


<h1
className="
text-3xl
font-bold
mb-8
"
>

Tour Assignment Management

</h1>





<div className="space-y-6">



{
tours.map(tour=>(


<div

key={tour._id}

className="
bg-white
shadow
rounded-xl
p-6
"

>


<h2
className="
text-xl
font-bold
"
>

{tour.title}

</h2>



<p>

Status:

<span
className="
ml-2
font-semibold
"
>

{
tour.assignmentStatus
||
"pending"
}

</span>

</p>





<div
className="
grid
grid-cols-3
gap-4
mt-5
"
>


<select
id={`guide-${tour._id}`}
className="border p-3 rounded"
>


<option>

Select Guide

</option>


{
guides.map(g=>(


<option

key={g._id}

value={g._id}

>

{g.name}

</option>


))

}



</select>





<select
id={`driver-${tour._id}`}
className="border p-3 rounded"
>


<option>

Select Driver

</option>


{
drivers.map(d=>(


<option

key={d._id}

value={d._id}

>

{d.name}

</option>


))

}



</select>






<select
id={`vehicle-${tour._id}`}
className="border p-3 rounded"
>


<option>

Select Vehicle

</option>


{
vehicles.map(v=>(


<option

key={v._id}

value={v._id}

>

{v.name}

-
{v.registrationNumber}

</option>


))

}



</select>



</div>






<button


onClick={()=>{


const guide =
document.getElementById(
`guide-${tour._id}`
).value;



const driver =
document.getElementById(
`driver-${tour._id}`
).value;



const vehicle =
document.getElementById(
`vehicle-${tour._id}`
).value;



handleAssign(

tour._id,

guide,

driver,

vehicle

);


}}


className="
mt-5
bg-green-700
text-white
px-5
py-2
rounded-lg
"


>

Assign Resources

</button>





</div>


))

}



</div>


</div>

);


}