import React,{
useEffect,
useState
}
from "react";


import {

useNavigate,

useParams

}
from "react-router-dom";


import {

toast

}
from "react-toastify";


import {

getTour,

updateTour,

getGuides,

getVehicles,

getDestinations

}

from "../../api/tourApi";





const EditTour =()=>{


const {
id
}
=
useParams();


const navigate =
useNavigate();




const [
guides,
setGuides
]
=
useState([]);



const [
vehicles,
setVehicles
]
=
useState([]);



const [
destinations,
setDestinations
]
=
useState([]);



const [
loading,
setLoading
]
=
useState(true);




const [
saving,
setSaving
]
=
useState(false);







const [
form,
setForm
]
=
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

tourResponse,

guideResponse,

vehicleResponse,

destinationResponse

]

=
await Promise.all([


getTour(id),

getGuides(),

getVehicles(),

getDestinations()


]);






const tour =
tourResponse.data.tour;






setForm({

title:
tour.title || "",


description:
tour.description || "",


category:
tour.category || "",


destination:
tour.destination?._id || "",


country:
tour.country || "",


date:

tour.date
?
tour.date.substring(0,10)
:
"",



capacity:
tour.capacity || 20,


duration:
tour.duration || 1,


difficulty:
tour.difficulty || "easy",


price:
tour.price || 0,


discount:
tour.discount || 0,


images:

tour.images
?
tour.images.join(",")
:
"",



guide:
tour.guide?._id || "",


vehicle:
tour.vehicle?._id || "",


status:
tour.status || "upcoming"


});





setGuides(
guideResponse.data.users || []
);



setVehicles(
vehicleResponse.data.vehicles || []
);



setDestinations(
destinationResponse.data.destinations || []
);



}

catch(error){


console.log(error);


toast.error(
"Failed loading tour"
);


}

finally{

setLoading(false);

}


};



loadData();



},[id]);









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


setSaving(true);




await updateTour(

id,

{

...form,

images:

form.images
.split(",")
.map(
img=>img.trim()
)


}

);





toast.success(
"Tour updated successfully"
);



navigate(
"/tour-manager/tours"
);



}

catch(error){


toast.error(

error.response?.data?.message ||

"Update failed"

);


}

finally{

setSaving(false);

}


};









if(loading){


return (

<div className="
p-10
text-center
">

Loading tour...

</div>

);


}










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

Edit Tour

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

className="input"

/>








<input

name="category"

value={form.category}

onChange={handleChange}

className="input"

/>








<select

name="destination"

value={form.destination}

onChange={handleChange}

className="input"

>


<option value="">

Destination

</option>



{

destinations.map(

item=>(


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

className="input"

/>








<textarea

name="description"

value={form.description}

onChange={handleChange}

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

className="input"

/>








<input

type="number"

name="duration"

value={form.duration}

onChange={handleChange}

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

className="input"

/>








<input

type="number"

name="discount"

value={form.discount}

onChange={handleChange}

className="input"

/>








<select

name="guide"

value={form.guide}

onChange={handleChange}

className="input"

>


<option value="">

Guide

</option>


{

guides.map(

item=>(


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








<select

name="vehicle"

value={form.vehicle}

onChange={handleChange}

className="input"

>


<option value="">

Vehicle

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

</option>


)

)

}



</select>








<select

name="status"

value={form.status}

onChange={handleChange}

className="input"

>


<option value="draft">
Draft
</option>


<option value="upcoming">
Upcoming
</option>


<option value="ongoing">
Ongoing
</option>


<option value="completed">
Completed
</option>


<option value="cancelled">
Cancelled
</option>



</select>








<input

name="images"

value={form.images}

onChange={handleChange}

className="
input
md:col-span-2
"

/>








<button

disabled={saving}

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

saving

?

"Saving..."

:

"Update Tour"

}


</button>






</form>


</div>


</div>

);


};



export default EditTour;