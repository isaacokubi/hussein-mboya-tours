import React,{useEffect,useState} from "react";
import {
getGuides,
assignGuide
}
from "../../api/tourManagerApi";


const AssignGuides=()=>{


const [guides,setGuides]=useState([]);


useEffect(()=>{

getGuides()
.then(res=>
setGuides(res.data)
);


},[]);



return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
">
Available Guides
</h1>



<div className="
grid
md:grid-cols-3
gap-5
mt-6
">


{
guides.map(guide=>(


<div
className="
bg-white
shadow
rounded-xl
p-5
"
key={guide._id}
>


<h2 className="font-bold">

{guide.name}

</h2>


<p>
Experience:
{guide.experience}
years
</p>


<button
className="
bg-green-700
text-white
p-2
rounded
mt-3
"
>
Assign Tour
</button>


</div>


))
}


</div>



</div>

)


}


export default AssignGuides;