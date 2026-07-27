import { Link, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { getTourBySlug } from "../api/tourApi";

import SEO from "../components/seo/SEO";


export default function TourDetails(){

const {
slug
}=useParams();



const {
data:tour,
isLoading,
isError
}=useQuery({

queryKey:[
"tour",
slug
],


queryFn:
()=>getTourBySlug(slug)


});





if(isLoading){

return(

<div className="p-10 text-center">

Loading tour...

</div>

);

}





if(isError || !tour){

return(

<div className="p-10 text-center text-red-600">

Tour not found

</div>

);

}





return(

<div className="
max-w-7xl
mx-auto
p-8
">


<SEO

title={tour.title}

description={tour.description}

image={tour.images?.[0]}

/>




<img

src={
tour.images?.[0] ||
"/placeholder.jpg"
}

alt={tour.title}

className="
w-full
h-[500px]
object-cover
rounded-2xl
"

/>





<h1 className="
text-5xl
font-bold
mt-8
">

{tour.title}

</h1>





<p className="
mt-5
text-gray-700
text-lg
">

{tour.description}

</p>






<div className="
mt-8
bg-gray-100
p-6
rounded-xl
">

<p className="
text-gray-500
">

Starting From

</p>


<h2 className="
text-4xl
font-bold
text-green-700
">

KES {tour.price}

</h2>


</div>







<h2 className="
text-3xl
font-bold
mt-10
">

Itinerary

</h2>




{
tour.itinerary?.map(
(day)=>(


<div

key={day.day}

className="
mt-5
border
p-5
rounded-xl
"

>


<h3 className="
font-bold
text-xl
">

Day {day.day}: {day.title}

</h3>


<p>

{day.description}

</p>


</div>


)

)

}







<Link

to={`/checkout?tour=${tour.slug}`}

className="
inline-block
mt-10
bg-yellow-600
text-white
px-8
py-4
rounded-xl
hover:bg-yellow-700
"

>

Book This Experience

</Link>





</div>

);

}