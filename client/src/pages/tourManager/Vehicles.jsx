import React, {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    FaCar,
    FaPlus
} from "react-icons/fa";



const API_URL =
import.meta.env.VITE_API_URL ||
"http://localhost:5000";





const Vehicles = () => {


const [vehicles,setVehicles] =
useState([]);


const [loading,setLoading] =
useState(true);






useEffect(()=>{


const fetchVehicles = async()=>{


try{


const response =

await axios.get(

`${API_URL}/api/vehicles`,

{

headers:{

Authorization:

`Bearer ${localStorage.getItem("token")}`

}

}

);



setVehicles(
response.data.vehicles || []
);



}

catch(error){

console.error(
"Vehicles loading error",
error
);


}

finally{

setLoading(false);

}


};



fetchVehicles();


},[]);







return (

<div className="
min-h-screen
bg-gray-100
p-6
">


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

loading

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

vehicles.map(

(vehicle)=>(


<div

key={vehicle._id}

className="
border
rounded-xl
p-5
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
{vehicle.registrationNumber}
</p>


<p>
Type:
{vehicle.type}
</p>



<span className="
inline-block
mt-3
bg-green-100
text-green-700
px-3
py-1
rounded-full
">

{vehicle.status}

</span>



</div>


)


)


}



</div>


}



</div>


</div>

);


};




export default Vehicles;