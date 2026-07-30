import React,{
useEffect,
useState
}
from "react";


import {
useParams,
useNavigate
}
from "react-router-dom";


import {
toast
}
from "react-toastify";


import {

getGuides,

assignGuide,

getTour

}

from "../../api/tourApi";






const AssignGuide =()=>{


const {
id
}
=
useParams();



const navigate =
useNavigate();




const [guides,setGuides]=
useState([]);



const [tour,setTour]=
useState(null);



const [guide,setGuide]=
useState("");





useEffect(()=>{


const loadData =
async()=>{


try{


const [

guideResponse,

tourResponse

]=

await Promise.all([

getGuides(),

getTour(id)

]);




setGuides(
guideResponse.data.users
);



setTour(
tourResponse.data.tour
);



setGuide(

tourResponse.data.tour.guide?._id
||
""

);



}

catch(error){


toast.error(
"Failed loading guides"
);


}



};



loadData();



},[id]);









const saveGuide =
async()=>{


try{


await assignGuide(

id,

guide

);



toast.success(
"Guide assigned successfully"
);



navigate(
"/tour-manager/tours"
);



}

catch(error){


toast.error(
"Assignment failed"
);


}



};







return (

<div
className="
min-h-screen
bg-gray-100
p-6
"
>



<div
className="
max-w-xl
mx-auto
bg-white
rounded-xl
shadow
p-8
"
>


<h1
className="
text-2xl
font-bold
mb-5
"
>

Assign Guide

</h1>





{

tour &&

<p
className="
mb-5
text-gray-600
"
>

Tour:

<strong>

{tour.title}

</strong>

</p>

}







<select

value={guide}

onChange={
e=>setGuide(e.target.value)
}

className="
border
rounded-lg
p-3
w-full
"

>


<option value="">

Select Guide

</option>



{

guides.map(

item=>(


<option

key={item._id}

value={item._id}

>

{item.name}

</option>


)

)

}



</select>







<button

onClick={saveGuide}

className="
mt-6
w-full
bg-green-600
text-white
py-3
rounded-lg
"

>

Assign Guide

</button>





</div>


</div>

);


};


export default AssignGuide;