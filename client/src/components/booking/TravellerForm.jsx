import {
    useEffect,
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








useEffect(()=>{


if(onChange){

onChange(travelers);

}


},[travelers,onChange]);









const updateTraveler=(index,field,value)=>{


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





setTravelers(updated);



};









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









const removeTraveler=(index)=>{


if(travelers.length===1){

return;

}



setTravelers(

travelers.filter(

(_,i)=>i!==index

)

);


};









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
