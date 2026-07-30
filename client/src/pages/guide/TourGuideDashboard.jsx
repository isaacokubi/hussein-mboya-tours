import {

useEffect,

useState

}

from "react";


import {

getGuideDashboard,

updateTourStatus

}

from "../../api/guideApi";



export default function TourGuideDashboard(){


const [tours,setTours]=useState([]);




useEffect(()=>{


getGuideDashboard()

.then(res=>{


setTours(

res.data.tours

);


});


},[]);





return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-8
">

Guide Dashboard

</h1>






<div className="space-y-5">


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


<h2 className="
text-xl
font-bold
">

{tour.title}

</h2>



<p>

Status:

{tour.tourStatus}

</p>




<p>

Vehicle:

{

tour.assignedVehicle?.name

}

</p>




<p>

Driver:

{

tour.assignedDriver?.name

}

</p>






<button

onClick={()=>


updateTourStatus(

tour._id,

"ongoing"

)


}

className="
bg-green-700
text-white
px-4
py-2
rounded
mt-4
"

>

Start Tour

</button>



</div>


))


}


</div>


</div>

);


}