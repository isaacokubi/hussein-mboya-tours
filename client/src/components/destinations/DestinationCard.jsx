import {
    Link
}
from "react-router-dom";


import LazyImage
from "../common/LazyImage";





export default function DestinationCard({

    destination = {}

}) {





const imageUrl =

typeof destination.images?.[0] === "object"

?

destination.images?.[0]?.url

:

destination.images?.[0];









return (

<div

className="
rounded-xl
overflow-hidden
shadow-lg
bg-white
transition
hover:shadow-2xl
"

>







<div

className="
overflow-hidden
"

>


<LazyImage


src={

imageUrl ||

"/images/destination-placeholder.jpg"

}



alt={

destination.name || "Destination"

}



className="
h-60
w-full
object-cover
hover:scale-105
transition
duration-500
"


/>



</div>









<div

className="
p-5
"

>








<h2

className="
text-2xl
font-bold
text-gray-800
"

>

{

destination.name || "Destination"

}

</h2>








<p

className="
text-gray-600
mt-2
"

>

{

destination.country || "Kenya"

}

</p>









{

destination.description &&

<p

className="
text-sm
text-gray-500
mt-3
line-clamp-3
"

>

{destination.description}

</p>

}









<Link


to={

`/destinations/${destination.slug || destination._id}`

}



className="
inline-block
mt-4
bg-yellow-600
text-white
px-4
py-2
rounded-lg
hover:bg-yellow-700
"

>

Explore Destination

</Link>







</div>







</div>


);


}