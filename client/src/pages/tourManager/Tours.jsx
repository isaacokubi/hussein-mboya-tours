import React, {useEffect, useState} from "react";
import {
getTours,
createTour,
deleteTour
} from "../../api/tourManagerApi";


const Tours =()=>{


const [tours,setTours]=useState([]);

const [form,setForm]=useState({

title:"",
destination:"",
price:"",
duration:"",
capacity:""

});



const loadTours=async()=>{

const res =
await getTours();

setTours(res.data);

};



useEffect(()=>{

loadTours();

},[]);



const submit=async(e)=>{

e.preventDefault();


await createTour(form);


setForm({

title:"",
destination:"",
price:"",
duration:"",
capacity:""

});


loadTours();


};



const remove=async(id)=>{

await deleteTour(id);

loadTours();

};



return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-6
">
Manage Tours
</h1>



<div className="
bg-white
rounded-xl
shadow
p-6
mb-8
">


<h2 className="font-bold text-xl mb-4">
Create New Tour
</h2>



<form
onSubmit={submit}
className="
grid
md:grid-cols-2
gap-4
"
>


<input
placeholder="Tour Name"
className="input"
value={form.title}
onChange={
e=>setForm({
...form,
title:e.target.value
})
}
/>



<input
placeholder="Destination"
className="input"
value={form.destination}
onChange={
e=>setForm({
...form,
destination:e.target.value
})
}
/>



<input
placeholder="Price"
className="input"
value={form.price}
onChange={
e=>setForm({
...form,
price:e.target.value
})
}
/>



<input
placeholder="Duration"
className="input"
value={form.duration}
onChange={
e=>setForm({
...form,
duration:e.target.value
})
}
/>



<input
placeholder="Capacity"
className="input"
value={form.capacity}
onChange={
e=>setForm({
...form,
capacity:e.target.value
})
}
/>


<button
className="
bg-green-700
text-white
rounded-lg
p-3
"
>
Create Tour
</button>


</form>


</div>





<div className="
grid
md:grid-cols-3
gap-6
">


{
tours.map(tour=>(


<div
key={tour._id}
className="
bg-white
shadow
rounded-xl
p-5
"
>


<h2 className="font-bold text-xl">
{tour.title}
</h2>


<p>
📍 {tour.destination}
</p>


<p>
Duration:
{tour.duration}
</p>


<p>
Capacity:
{tour.capacity}
</p>


<button

onClick={()=>remove(tour._id)}

className="
mt-4
bg-red-600
text-white
px-4
py-2
rounded
"

>
Delete
</button>


</div>


))
}


</div>



</div>

)

}


export default Tours;