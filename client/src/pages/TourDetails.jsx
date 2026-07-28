import {
useQuery
} from "@tanstack/react-query";


import {
useParams,
Link
}
from "react-router-dom";


import {
getTourById
}
from "../api/tourApi";



export default function TourDetails(){


const {
id
}=useParams();



const {
data:tour,
isLoading
}
=
useQuery({

queryKey:[
"tour",
id
],

queryFn:
()=>getTourById(id)

});




if(isLoading){

return (

<div className="
py-20
text-center
">

Loading tour...

</div>

)

}




return (

<div className="
container
mx-auto
px-6
py-20
">


<div className="
grid
md:grid-cols-2
gap-10
">


<img

src={tour.image}

alt={tour.title}

className="
rounded-2xl
h-[500px]
w-full
object-cover
"

/>



<div>


<h1 className="
text-5xl
font-bold
">

{tour.title}

</h1>



<p className="
mt-5
text-gray-600
text-lg
">

{tour.description}

</p>



<div className="
mt-6
text-3xl
font-bold
text-green-600
">

${tour.price}

</div>




<div className="
mt-8
space-y-3
">


<p>
📍 {tour.location}
</p>


<p>
⏳ {tour.duration}
</p>


<p>
🏕 {tour.category}
</p>


</div>




<Link

to={`/checkout/${tour._id}`}

className="
inline-block
mt-10
bg-green-600
text-white
px-10
py-4
rounded-full
font-bold
"

>

Book This Adventure

</Link>


</div>


</div>


</div>

)


}