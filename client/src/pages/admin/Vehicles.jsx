import {
  useEffect,
  useState
} from "react";


import {
  getVehicles,
  deleteVehicle,
  assignDriver,
  getDrivers
} from "../../api/vehicleApi";


import AddVehicleModal
from "../../components/admin/AddVehicleModal";


import {
  Car,
  Users,
  CheckCircle,
  Wrench
} from "lucide-react";





export default function Vehicles(){



const [vehicles,setVehicles]=useState([]);


const [drivers,setDrivers]=useState([]);


const [loading,setLoading]=useState(true);


const [showAdd,setShowAdd]=useState(false);








/*
|--------------------------------------------------------------------------
| LOAD VEHICLES
|--------------------------------------------------------------------------
*/

const loadVehicles = async()=>{


try{


const res = await getVehicles();


setVehicles(

res.data.vehicles

);


}

catch(error){


console.log(error);


}

finally{


setLoading(false);


}


};









/*
|--------------------------------------------------------------------------
| LOAD DRIVERS
|--------------------------------------------------------------------------
*/

const loadDrivers = async()=>{


try{


const res = await getDrivers();


setDrivers(

res.data.drivers

);


}

catch(error){


console.log(error);


}


};









useEffect(()=>{


loadVehicles();


loadDrivers();


},[]);









/*
|--------------------------------------------------------------------------
| DELETE VEHICLE
|--------------------------------------------------------------------------
*/


const removeVehicle = async(id)=>{


if(

!window.confirm(

"Remove this vehicle?"

)

)

return;




try{


await deleteVehicle(id);


loadVehicles();


}

catch(error){


console.log(error);


}


};









/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/


const handleAssignDriver = async(vehicleId)=>{


const driverId =

window.prompt(

"Enter Driver ID"

);



if(!driverId)

return;




try{


await assignDriver(

vehicleId,

driverId

);



loadVehicles();


}

catch(error){


console.log(error);


}


};









const stats={


total:

vehicles.length,



available:

vehicles.filter(

v=>v.status==="Available"

).length,



assigned:

vehicles.filter(

v=>v.status==="Assigned"

).length,



maintenance:

vehicles.filter(

v=>v.status==="Maintenance"

).length


};









if(loading)


return (

<div className="p-10">

Loading vehicles...

</div>

);









return (

<div className="p-6">





<h1

className="
text-3xl
font-bold
mb-6
"

>

Vehicle Management

</h1>









<button

onClick={()=>setShowAdd(true)}

className="
bg-green-700
text-white
px-5
py-3
rounded-lg
mb-5
"

>

+ Add Vehicle

</button>









{/* =========================
STATISTICS
========================= */}



<div

className="
grid
grid-cols-4
gap-5
mb-10
"

>



<Card

title="Total Vehicles"

value={stats.total}

icon={<Car/>}

/>





<Card

title="Available"

value={stats.available}

icon={<CheckCircle/>}

/>





<Card

title="Assigned"

value={stats.assigned}

icon={<Users/>}

/>





<Card

title="Maintenance"

value={stats.maintenance}

icon={<Wrench/>}

/>



</div>









{/* =========================
VEHICLE TABLE
========================= */}



<div

className="
bg-white
rounded-xl
shadow
overflow-hidden
"

>



<table

className="
w-full
"

>



<thead

className="
bg-gray-100
"

>



<tr>



<th className="p-4">

Image

</th>





<th className="p-4 text-left">

Name

</th>





<th className="p-4 text-left">

Registration

</th>





<th className="p-4 text-left">

Type

</th>





<th className="p-4 text-left">

Capacity

</th>





<th className="p-4 text-left">

Driver

</th>





<th className="p-4 text-left">

Status

</th>





<th className="p-4">

Actions

</th>



</tr>



</thead>









<tbody>



{

vehicles.map(vehicle=>(



<tr

key={vehicle._id}

className="
border-b
"

>







{/* VEHICLE IMAGE */}



<td className="p-4">



<img


src={

vehicle.image?.url ||

"/vehicle-placeholder.png"

}


alt={vehicle.name}


className="
w-16
h-16
object-cover
rounded
"

/>



</td>









<td className="p-4">


{vehicle.name}


</td>









<td className="p-4">


{vehicle.registrationNumber}


</td>









<td className="p-4">


{vehicle.type}


</td>









<td className="p-4">


{vehicle.capacity}


</td>









<td className="p-4">


{

vehicle.driver

?

vehicle.driver.name

:

"No driver"

}


</td>









<td className="p-4">



<span

className="
px-3
py-1
rounded-full
text-sm
bg-green-100
"

>


{vehicle.status}


</span>



</td>









<td className="p-4 space-x-2">





<button


onClick={()=>handleAssignDriver(vehicle._id)}


className="
bg-blue-600
text-white
px-3
py-1
rounded
"

>

Assign

</button>







<button


onClick={()=>removeVehicle(vehicle._id)}


className="
bg-red-600
text-white
px-3
py-1
rounded
"

>

Delete

</button>







</td>







</tr>



))


}




</tbody>







</table>






</div>









{/* ADD VEHICLE MODAL */}



{

showAdd &&


<AddVehicleModal


close={()=>setShowAdd(false)}


refresh={loadVehicles}


/>


}







</div>

);


}









function Card({

title,

value,

icon

}){


return (


<div

className="
bg-white
shadow
rounded-xl
p-5
flex
justify-between
"

>


<div>


<p

className="
text-gray-500
"

>

{title}

</p>




<h2

className="
text-3xl
font-bold
"

>

{value}

</h2>



</div>






<div>

{icon}

</div>





</div>


);


}