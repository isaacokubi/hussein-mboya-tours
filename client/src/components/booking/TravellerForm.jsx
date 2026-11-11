/**
 * Purpose: Traveller Form reusable UI component. Main declarations: TravelerForm, updateTraveler, addTraveler, removeTraveler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
    useEffect,
    useState
}
from "react";





// Define TravelerForm; its parameters and body implement this operation.
export default function TravelerForm({

    onChange

}){





// Declare [ travelers, setTravelers ] for use by the surrounding module or function.
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








// Perform the side effect or state update expressed on the following line.
useEffect(()=>{


// Check the condition (onChange) and run the matching branch.
if(onChange){

// Perform the side effect or state update expressed on the following line.
onChange(travelers);

}


},[travelers,onChange]);









// Declare updateTraveler for use by the surrounding module or function.
const updateTraveler=(index,field,value)=>{


// Declare updated for use by the surrounding module or function.
const updated = travelers.map(

(traveler,i)=>

i===index

?

{

...traveler,

[field]:value

}

:

traveler

);





// Perform the side effect or state update expressed on the following line.
setTravelers(updated);



};









// Declare addTraveler for use by the surrounding module or function.
const addTraveler=()=>{


// Perform the side effect or state update expressed on the following line.
setTravelers([

...travelers,

{

name:"",

age:"",

passportNumber:""

}

]);


};









// Declare removeTraveler for use by the surrounding module or function.
const removeTraveler=(index)=>{


// Check the condition (travelers.length===1) and run the matching branch.
if(travelers.length===1){

// Return the result to the caller.
return;

}



// Perform the side effect or state update expressed on the following line.
setTravelers(

travelers.filter(

(_,i)=>i!==index

)

);


};









// Return the expression shown below to the caller.
return (

<div>





{

travelers.map(

(traveler,index)=>(



<div

key={index}

className="
space-y-3
mb-6
border
p-4
rounded-lg
"

>





<h3

className="
font-semibold
"

>

Traveler {index+1}

</h3>







<input


value={traveler.name}


className="
border
p-3
w-full
rounded
"


placeholder="Full Name"


onChange={

e=>

updateTraveler(

index,

"name",

e.target.value

)

}



/>









<input


type="number"


value={traveler.age}


className="
border
p-3
w-full
rounded
"


placeholder="Age"


onChange={

e=>

updateTraveler(

index,

"age",

e.target.value

)

}



/>









<input


value={traveler.passportNumber}


className="
border
p-3
w-full
rounded
"


placeholder="Passport Number"


onChange={

e=>

updateTraveler(

index,

"passportNumber",

e.target.value

)

}



/>









<button


type="button"


onClick={()=>removeTraveler(index)}


className="
text-red-600
text-sm
"

>

Remove Traveler

</button>







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
