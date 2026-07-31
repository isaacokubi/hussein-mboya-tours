import {

useEffect,

useState

}

from "react";



import {

Link

}

from "react-router-dom";



import {

FaBinoculars,

FaUmbrellaBeach,

FaMountain,

FaPeopleGroup,

FaMap

}

from "react-icons/fa6";



import {

getCategories

}

from "../../api/categoryApi";






const iconMap={


Binoculars:FaBinoculars,

Beach:FaUmbrellaBeach,

Mountain:FaMountain,

People:FaPeopleGroup,

Map:FaMap


};








export default function CategoriesSection(){





const [

categories,

setCategories

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


loadCategories();


},[]);








const loadCategories=async()=>{


try{


const data =
await getCategories();



setCategories(data);



}

finally{


setLoading(false);


}



};









if(loading){


return (

<section className="py-20 text-center">

Loading experiences...

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

Explore Travel Experiences

</h2>









<div

className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-6
"

>







{

categories.map(category=>{



const Icon =

iconMap[category.icon]

||

FaMap;







return (

<div

key={category._id}

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





<div

className="
text-green-600
text-4xl
flex
justify-center
mb-5
"

>

<Icon/>

</div>








<h3

className="
font-bold
text-xl
"

>

{category.name}

</h3>








<p

className="
mt-3
text-gray-600
"

>

{category.description}

</p>








<Link

to={`/tours/category/${category.slug}`}

className="
inline-block
mt-5
text-yellow-700
font-semibold
"

>

View Tours →

</Link>







</div>


);



})


}







</div>







</div>







</section>


);



}