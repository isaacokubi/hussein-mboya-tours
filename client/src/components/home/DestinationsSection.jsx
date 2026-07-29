import { motion } from "framer-motion";
import { Link } from "react-router-dom";


export default function DestinationsSection(){


const destinations=[

{
name:"Maasai Mara",
description:"Experience Kenya's famous wildlife safari destination."
},


{
name:"Diani Beach",
description:"Relax on one of Kenya's most beautiful beaches."
},


{
name:"Mount Kenya",
description:"Adventure through breathtaking mountain landscapes."
}

];




return (

<section className="py-16 bg-white">


<div className="max-w-7xl mx-auto px-6">



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





<div className="
grid
md:grid-cols-3
gap-8
">


{

destinations.map((destination,index)=>(


<Link

key={index}

to="/destinations"

>


<motion.div


whileHover={{
scale:1.05
}}


className="
rounded-xl
shadow-lg
p-6
bg-gray-50
cursor-pointer
hover:shadow-2xl
transition
"


>


<h3 className="
text-xl
font-semibold
mb-3
">

{destination.name}

</h3>




<p className="text-gray-600">

{destination.description}

</p>



</motion.div>


</Link>


))

}



</div>


</div>


</section>

);


}