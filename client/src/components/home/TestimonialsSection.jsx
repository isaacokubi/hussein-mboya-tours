import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    name: "Sarah Williams",
    country: "United Kingdom",
    image: "/testimonials/sarah.jpg",
    message:
      "Hussein Mboya Tours gave us the best safari experience in Kenya. The guides were professional and the entire trip was perfectly organized.",
  },

  {
    name: "James Anderson",
    country: "United States",
    image: "/testimonials/james.jpg",
    message:
      "From airport pickup to the Maasai Mara adventure, everything was handled professionally. Highly recommended.",
  },

  {
    name: "Amina Hassan",
    country: "United Arab Emirates",
    image: "/testimonials/amina.jpg",
    message:
      "The beach holiday package was amazing. Beautiful hotels, friendly guides and unforgettable memories.",
  },
];


export default function TestimonialsSection(){

return (

<section className="py-20 bg-white">

<div className="container mx-auto px-6">


<h2 className="
text-4xl
font-bold
text-center
mb-12
">

Traveler Experiences

</h2>



<div className="
grid
md:grid-cols-3
gap-8
">


{
testimonials.map((item)=>(

<motion.div

key={item.name}

whileHover={{
y:-10
}}

className="
bg-gray-50
rounded-2xl
shadow-lg
p-8
text-center
"

>


<FaQuoteLeft
className="
text-green-600
text-3xl
mx-auto
mb-5
"
/>


<img

src={item.image}

alt={item.name}

className="
w-20
h-20
rounded-full
object-cover
mx-auto
"

/>


<h3 className="
text-xl
font-bold
mt-5
">

{item.name}

</h3>


<p className="
text-gray-500
">

{item.country}

</p>



<p className="
mt-5
text-gray-600
leading-relaxed
">

"{item.message}"

</p>



</motion.div>


))
}



</div>


</div>


</section>

)

}