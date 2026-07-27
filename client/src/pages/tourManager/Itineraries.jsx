import React, {useState} from "react";
import {
createItinerary
} from "../../api/tourManagerApi";


const Itineraries =()=>{


const [itinerary,setItinerary]=useState({

tour:"",
days:[]

});


const [day,setDay]=useState({

title:"",
description:"",
time:""

});



const addDay=()=>{

setItinerary({

...itinerary,

days:[
...itinerary.days,
day
]

});


setDay({

title:"",
description:"",
time:""

});


};



const save=async()=>{

await createItinerary(itinerary);


alert(
" Itinerary Created"
);


};



return (

<div className="p-6">


<h1 className="
text-3xl
font-bold
mb-6
">
Itinerary Builder
</h1>



<div className="
bg-white
shadow
rounded-xl
p-6
">


<input

className="input mb-4"

placeholder="Tour Name"

value={itinerary.tour}

onChange={
e=>
setItinerary({
...itinerary,
tour:e.target.value
})
}

/>



<h2 className="
font-bold
text-xl
">
Add Day Schedule
</h2>



<input

className="input"

placeholder="Day Title"

value={day.title}

onChange={
e=>
setDay({
...day,
title:e.target.value
})
}

/>



<input

className="input"

placeholder="Time"

value={day.time}

onChange={
e=>
setDay({
...day,
time:e.target.value
})
}

/>



<textarea

className="
input
mt-3
"

placeholder="Activity Description"

value={day.description}

onChange={
e=>
setDay({
...day,
description:e.target.value
})
}

/>



<button

onClick={addDay}

className="
bg-blue-700
text-white
px-5
py-3
rounded-lg
mt-4
"

>
Add Day
</button>




<div className="mt-6">


{
itinerary.days.map(
(item,index)=>(


<div
key={index}
className="
border
p-4
rounded
mb-3
"
>


<h3 className="font-bold">
Day {index+1}: {item.title}
</h3>


<p>
⏰ {item.time}
</p>


<p>
{item.description}
</p>


</div>


))
}


</div>




<button

onClick={save}

className="
bg-green-700
text-white
px-6
py-3
rounded-lg
"

>
Save Itinerary
</button>


</div>


</div>


)


}


export default Itineraries;