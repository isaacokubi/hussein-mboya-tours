import {
useState
}
from "react";


export default function TravelerForm({
onChange
}){


const [
travelers,
setTravelers
]
=
useState([

{
name:"",
age:"",
passportNumber:""
}

]);



const addTraveler=()=>{


setTravelers([

...travelers,

{
name:"",
age:"",
passportNumber:""
}

]);


};



return (

<div>


{

travelers.map(
(item,index)=>(


<div
key={index}
className="
space-y-3
mb-5
"
>


<input

className="
border p-3 w-full
"

placeholder="
Full Name
"

/>


<input

className="
border p-3 w-full
"

placeholder="
Passport Number
"

/>


</div>


)

)

}



<button

type="button"

onClick={addTraveler}

className="
bg-black
text-white
px-5
py-2
rounded
"

>

Add Traveler

</button>


</div>

);

}