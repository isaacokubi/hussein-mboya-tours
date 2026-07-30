import React,{
useEffect,
useState
}
from "react";


import {
useNavigate
}
from "react-router-dom";


import {
toast
}
from "react-toastify";


import {
createTour,
getGuides,
getVehicles,
getDestinations
}
from "../../api/tourApi";





const CreateTour = ()=>{


const navigate =
useNavigate();




const [loading,setLoading]=
useState(false);



const [guides,setGuides]=
useState([]);


const [vehicles,setVehicles]=
useState([]);


const [destinations,setDestinations]=
useState([]);





const [form,setForm]=
useState({

title:"",

description:"",

category:"",

destination:"",

country:"",

date:"",

capacity:20,

duration:1,

difficulty:"easy",

price:0,

discount:0,

images:"",

guide:"",

vehicle:"",

status:"upcoming"


});








useEffect(()=>{


const loadData =
async()=>{


try{


const [
guideRes,
vehicleRes,
destinationRes

]=await Promise.all([

getGuides(),

getVehicles(),

getDestinations()

]);



setGuides(
guideRes.data.users || []
);



setVehicles(
vehicleRes.data.vehicles || []
);



setDestinations(
destinationRes.data.destinations || []
);



}
catch(error){


console.log(error);


toast.error(
"Failed loading data"
);


}



};



loadData();


},[]);









const handleChange=(e)=>{


setForm({

...form,

[e.target.name]:
e.target.value


});


};









const submitHandler =
async(e)=>{


e.preventDefault();


try{


setLoading(true);



await createTour({

...form,

images:

form.images
.split(",")
.map(
img=>img.trim()
)


});




toast.success(
"Tour created successfully"
);



navigate(
"/tour-manager/tours"
);



}

catch(error){


toast.error(

error.response?.data?.message ||

"Tour creation failed"

);


}

finally{

setLoading(false);

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
max-w-5xl
mx-auto
bg-white
rounded-xl
shadow
p-8
"
>


<h1
className="
text-3xl
font-bold
mb-6
"
>

Create New Tour

</h1>





<form
onSubmit={submitHandler}
className="
grid
md:grid-cols-2
gap-5
"
>





<input

name="title"

value={form.title}

onChange={handleChange}

placeholder="Tour title"

className="input"

/>





<input

name="category"

value={form.category}

onChange={handleChange}

placeholder="Category"

className="input"

/>







<select

name="destination"

value={form.destination}

onChange={handleChange}

className="input"

>


<option value="">
Select Destination
</option>



{

destinations.map(
(item)=>(


<option
key={item._id}
value={item._id}
>

{item.name}

</option>


)

)

}



</select>








<input

name="country"

value={form.country}

onChange={handleChange}

placeholder="Country"

className="input"

/>








<textarea

name="description"

value={form.description}

onChange={handleChange}

placeholder="Description"

className="
input
md:col-span-2
"

/>







<input

type="date"

name="date"

value={form.date}

onChange={handleChange}

className="input"

/>






<input

type="number"

name="capacity"

value={form.capacity}

onChange={handleChange}

placeholder="Capacity"

className="input"

/>







<input

type="number"

name="duration"

value={form.duration}

onChange={handleChange}

placeholder="Duration days"

className="input"

/>







<select

name="difficulty"

value={form.difficulty}

onChange={handleChange}

className="input"

>


<option value="easy">
Easy
</option>


<option value="moderate">
Moderate
</option>


<option value="hard">
Hard
</option>


</select>







<input

type="number"

name="price"

value={form.price}

onChange={handleChange}

placeholder="Price"

className="input"

/>







<input

type="number"

name="discount"

value={form.discount}

onChange={handleChange}

placeholder="Discount"

className="input"

/>







<select

name="guide"

value={form.guide}

onChange={handleChange}

className="input"

>


<option value="">
Assign Guide
</option>



{

guides.map(
guide=>(


<option

key={guide._id}

value={guide._id}

>

{guide.name}

</option>


)

)

}


</select>








<select

name="vehicle"

value={form.vehicle}

onChange={handleChange}

className="input"

>


<option value="">
Assign Vehicle
</option>



{

vehicles.map(
vehicle=>(


<option

key={vehicle._id}

value={vehicle._id}

>

{vehicle.name}
-
{vehicle.registration}

</option>


)

)

}


</select>







<input

name="images"

value={form.images}

onChange={handleChange}

placeholder="
Image URLs separated by comma
"

className="
input
md:col-span-2
"

/>








<button

disabled={loading}

className="
md:col-span-2
bg-orange-600
text-white
py-3
rounded-lg
font-semibold
"

>


{

loading
?
"Creating..."
:
"Create Tour"

}


</button>






</form>


</div>


</div>

);


};


export default CreateTour;