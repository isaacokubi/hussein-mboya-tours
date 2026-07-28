import {
FaShield,
FaUserTie,
FaClock,
FaStar
} from "react-icons/fa6";


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

<section className="
py-20
bg-green-700
text-white
">


<div className="
container
mx-auto
px-6
">


<h2 className="
text-4xl
font-bold
text-center
mb-12
">

Why Choose Hussein Mboya Tours?

</h2>


<div className="
grid
md:grid-cols-4
gap-8
">


{
reasons.map(item=>(


<div
key={item.title}

className="
text-center
"

>


<div className="
text-4xl
flex
justify-center
mb-5
">

{item.icon}

</div>


<h3 className="
text-xl
font-bold
">

{item.title}

</h3>


<p className="
mt-3
opacity-90
">

{item.text}

</p>


</div>


))
}



</div>


</div>


</section>

)

}