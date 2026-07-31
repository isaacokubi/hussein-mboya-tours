import {

useEffect,

useState

}

from "react";


import {

motion

}

from "framer-motion";


import {

Link

}

from "react-router-dom";


import {

getFeaturedDestinations

}

from "../../api/destinationApi";


import LazyImage

from "../common/LazyImage";






export default function DestinationsSection(){



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








useEffect(()=>{


loadDestinations();


},[]);







const loadDestinations=async()=>{


try{


const data =

await getFeaturedDestinations();



setDestinations(data);



}

finally{


setLoading(false);


}


};








if(loading){


return (

<section className="py-16 text-center">

Loading destinations...

</section>

);


}








return (

<section

className="
py-16
bg-white
"

>







<div

className="
max-w-7xl
mx-auto
px-6
"

>








<motion.h2


initial={{

opacity:0,

y:30

}}


whileInView={{

opacity:1,

y:0

}}


transition={{

duration:0.6

}}



className="
text-3xl
font-bold
text-center
mb-10
"

>

Explore Our Destinations

</motion.h2>









<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-8
"

>







{

destinations.map(destination=>(



<Link

key={destination._id}

to={`/destinations/${destination.slug}`}

>







<motion.div



whileHover={{

scale:1.05

}}



className="
rounded-xl
shadow-lg
overflow-hidden
bg-gray-50
cursor-pointer
hover:shadow-2xl
transition
"

>







<LazyImage


src={destination.images?.[0]?.url}


alt={destination.name}


className="
h-48
w-full
object-cover
"

/>









<div

className="
p-6
"

>





<h3

className="
text-xl
font-semibold
mb-3
"

>

{destination.name}

</h3>







<p

className="
text-gray-600
"

>

{destination.description}

</p>







</div>







</motion.div>





</Link>


))


}







</div>








</div>







</section>


);


}