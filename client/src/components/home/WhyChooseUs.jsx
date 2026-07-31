import { motion } from "framer-motion";


import {
FaShield,
FaUserTie,
FaClock,
FaStar
}
from "react-icons/fa6";



const reasons=[


{
icon:<FaUserTie/>,
title:"Expert Local Guides",
text:"Our experienced guides provide authentic Kenyan experiences."
},


{
icon:<FaShield/>,
title:"Safe Travel",
text:"Your safety and comfort are our highest priority."
},


{
icon:<FaClock/>,
title:"24/7 Support",
text:"We are available throughout your journey."
},


{
icon:<FaStar/>,
title:"Premium Experience",
text:"Luxury accommodation and personalized service."
}


];






export default function WhyChooseUs(){



return (

<section

className="
py-20
bg-gradient-to-r
from-green-700
to-green-800
text-white
"

>



<div

className="
container
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
md:text-4xl
font-bold
text-center
mb-12
"

>

Why Choose Hussein Mboya Tours?

</motion.h2>









<div

className="
grid
grid-cols-1
sm:grid-cols-2
md:grid-cols-4
gap-8
"

>








{

reasons.map((item,index)=>(



<motion.div


key={item.title}



initial={{

opacity:0,

y:40

}}



whileInView={{

opacity:1,

y:0

}}



transition={{

duration:0.5,

delay:index*0.1

}}



viewport={{

once:true

}}



className="
text-center
"

>








<div

className="
w-20
h-20
mx-auto
rounded-full
bg-white/20
flex
items-center
justify-center
text-4xl
mb-5
"

>

{item.icon}

</div>









<h3

className="
text-xl
font-bold
"

>

{item.title}

</h3>









<p

className="
mt-3
text-green-100
leading-relaxed
"

>

{item.text}

</p>








</motion.div>



))

}







</div>






</div>





</section>


);


}