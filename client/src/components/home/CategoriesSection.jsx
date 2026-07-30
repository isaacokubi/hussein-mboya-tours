import {
FaBinoculars,
FaUmbrellaBeach,
FaMountain,
FaPeopleGroup
} from "react-icons/fa6";


const categories=[

{
title:"Wildlife Safaris",
icon:<FaBinoculars/>,
description:
"Explore Kenya's famous national parks and wildlife reserves."
},

{
title:"Beach Holidays",
icon:<FaUmbrellaBeach/>,
description:
"Relax on the beautiful beaches of Diani, Mombasa and Malindi."
},

{
title:"Adventure Tours",
icon:<FaMountain/>,
description:
"Experience hiking, camping and thrilling outdoor activities."
},

{
title:"Cultural Experiences",
icon:<FaPeopleGroup/>,
description:
"Discover authentic African traditions and communities."
}

];



export default function CategoriesSection(){


return (

<section className="
py-20
bg-gray-100
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

Explore Travel Experiences

</h2>



<div className="
grid
md:grid-cols-4
gap-6
">


{
categories.map(category=>(


<div

key={category.title}

className="
bg-white
rounded-xl
shadow-lg
p-8
text-center
hover:-translate-y-2
transition
"

>


<div className="
text-green-600
text-4xl
flex
justify-center
mb-5
">

{category.icon}

</div>


<h3 className="
font-bold
text-xl
">

{category.title}

</h3>


<p className="
mt-3
text-gray-600
">

{category.description}

</p>


</div>


))
}


</div>


</div>


</section>

)


}