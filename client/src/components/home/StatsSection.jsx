import CountUp from "react-countup";
import { motion } from "framer-motion";



const StatsSection = () => {


const stats = [

{
number:5000,
label:"Happy Travelers"
},

{
number:300,
label:"Tours Completed"
},

{
number:50,
label:"Destinations"
},

{
number:10,
label:"Years Experience"
}

];





return (

<section

className="
py-20
bg-white
"

>


<div

className="
container
mx-auto
px-6
"

>


<div

className="
grid
grid-cols-1
sm:grid-cols-2
md:grid-cols-4
gap-8
text-center
"

>


{

stats.map((stat,index)=>(



<motion.div


key={stat.label}


initial={{

opacity:0,

y:30

}}


whileInView={{

opacity:1,

y:0

}}


transition={{

duration:0.5,

delay:index * 0.1

}}


viewport={{

once:true

}}


>



<h2

className="
text-4xl
md:text-5xl
font-bold
text-green-600
"

>


<CountUp

end={stat.number}

duration={3}

separator=","

/>


+


</h2>






<p

className="
mt-3
text-gray-600
font-medium
"

>

{stat.label}

</p>






</motion.div>



))

}



</div>





</div>




</section>


);

};



export default StatsSection;