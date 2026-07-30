import React from "react";


const notifications=[

"5 bookings awaiting confirmation",

"Vehicle KDA 234A service due tomorrow",

"Guide John unavailable",

"New payment received KES 45,000"

];



const Notifications=()=>{


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
text-xl
font-bold
mb-5
">
Notifications
</h2>



<div className="
space-y-4
">


{

notifications.map(
(item,index)=>(


<div
key={index}
className="
bg-gray-100
rounded-lg
p-3
text-sm
"
>

🔔 {item}

</div>


)

)

}


</div>


</div>


)

}


export default Notifications;