
import React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import api from "../api/axios";


const DestinationDetails = ()=>{


const {slug}=useParams();


const {data,isLoading}=useQuery({

queryKey:["destination",slug],

queryFn:async()=>{

const res = await api.get(
`/destinations/${slug}`
);

return res.data;

}

});



if(isLoading){

return (
<div className="p-10">
Loading destination...
</div>
)

}



const destination=data?.destination || data?.data;



if(!destination){

return (

<div className="p-10">

Destination not found

</div>

)

}



const image =
destination.images?.[0]?.url ||
destination.images?.[0];



return (

<div className="max-w-6xl mx-auto p-6">


<div className="rounded-xl overflow-hidden shadow">


{image && (

<img

src={image}

alt={destination.name}

className="
w-full
h-[420px]
object-cover
"

/>

)}


</div>



<h1 className="
text-4xl
font-bold
mt-8
">

{destination.name}

</h1>



<p className="mt-3 text-gray-600">

{destination.country}

{destination.city &&
`, ${destination.city}`}

</p>



<p className="
mt-6
text-lg
leading-relaxed
">

{destination.description}

</p>



{
destination.tours?.length > 0 && (

<div className="mt-12">


<h2 className="
text-2xl
font-bold
mb-5
">

Available Tours

</h2>



<div className="
grid
md:grid-cols-3
gap-6
">


{
destination.tours.map((tour)=>(


<div

key={tour._id}

className="
border
rounded-xl
overflow-hidden
shadow
"

>


{
tour.images?.[0]?.url && (

<img

src={tour.images[0].url}

className="
h-40
w-full
object-cover
"

/>

)

}



<div className="p-4">


<h3 className="font-bold">

{tour.title}

</h3>


<p className="mt-2">

{tour.duration}

</p>


</div>


</div>


))

}



</div>


</div>

)

}



</div>


)


}


export default DestinationDetails;
