import { useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";


import { getFeaturedTours } from "../../api/tourApi";


import LazyImage from "../common/LazyImage";







export default function FeaturedTours() {



const {

data,

isLoading,

isError,

error

}

=

useQuery({

queryKey:["featuredTours"],

queryFn:getFeaturedTours

});









const tours =

Array.isArray(data)

?

data

:

data?.tours ||

data?.data?.tours ||

data?.data ||

[];









if(isLoading){


return (

<section className="py-20">

<div className="
grid
md:grid-cols-3
gap-8
container
mx-auto
px-6
">


{

[1,2,3].map(item=>(


<div

key={item}

className="
h-96
bg-gray-200
animate-pulse
rounded-xl
"

/>


))

}



</div>

</section>

);


}








if(isError){


return (

<section className="
py-20
text-center
">


<p className="
text-red-600
font-semibold
">

Failed to load featured tours.

</p>


<p className="
text-gray-500
mt-2
">

{error?.message}

</p>



</section>


);


}









return (

<section

className="
py-20
bg-gray-100
"

>





<div

className="
container
mx-auto
px-6
"

>







<h2

className="
text-4xl
font-bold
text-center
mb-12
"

>

Featured Tours

</h2>









<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-8
"

>









{

tours.map(tour=>(



<div

key={tour._id}

className="
bg-white
rounded-xl
overflow-hidden
shadow-lg
hover:shadow-2xl
transition
duration-300
"

>










<div

className="
relative
"

>





<LazyImage



src={

typeof tour.images?.[0] === "object"

?

tour.images?.[0]?.url

:

tour.images?.[0]



||

tour.destination?.images?.[0]?.url

||

tour.image

}



alt={

tour.title ||

"Tour"

}



className="
h-64
w-full
object-cover
"

/>








<div

className="
absolute
top-4
left-4
bg-yellow-500
text-white
px-3
py-1
rounded-full
text-sm
font-semibold
"

>

Featured

</div>







</div>










<div

className="
p-6
"

>






<h3

className="
text-xl
font-bold
"

>

{tour.title || "African Adventure Tour"}

</h3>









<p

className="
text-gray-600
mt-2
"

>

{tour.destination?.name || "Kenya"}

</p>









{

tour.duration &&

<p

className="
text-sm
text-gray-500
mt-2
"

>

Duration: {tour.duration}

</p>

}









{

tour.price &&

<p

className="
text-green-600
font-bold
text-lg
mt-4
"

>

KES {Number(tour.price).toLocaleString()}

</p>

}









<Link


to={`/tours/${tour.slug || tour._id}`}



className="
block
mt-5
bg-green-600
hover:bg-green-700
text-white
text-center
py-3
rounded-lg
transition
"

>

View Tour

</Link>








</div>









</div>



))

}



</div>









{

tours.length===0 &&

<div

className="
text-center
mt-10
"

>

<p className="
text-gray-500
text-lg
">

No featured tours available.

</p>

</div>

}









</div>







</section>


);


}