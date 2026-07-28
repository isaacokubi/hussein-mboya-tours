import {
useQuery
}
from "@tanstack/react-query";

import axios from "axios";



export default function AdminDashboard(){


const {
data
}
=
useQuery({

queryKey:[
"adminStats"
],

queryFn:async()=>{


const response =
await axios.get(

`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`,

{

headers:{

Authorization:
`Bearer ${localStorage.getItem("token")}`

}

}

);


return response.data;


}

});





return (

<div className="
container
mx-auto
px-6
py-20
">


<h1 className="
text-4xl
font-bold
mb-10
">

Admin Dashboard

</h1>




<div className="
grid
md:grid-cols-4
gap-6
">


<Card
title="Users"
value={data?.users}
/>


<Card
title="Tours"
value={data?.tours}
/>


<Card
title="Bookings"
value={data?.bookings}
/>


<Card
title="Revenue"
value={`$${data?.revenue}`}
/>



</div>



</div>

)

}



function Card({title,value}){


return (

<div className="
bg-white
shadow-lg
rounded-xl
p-6
">


<h3 className="
text-gray-500
">

{title}

</h3>


<p className="
text-3xl
font-bold
mt-3
">

{value || 0}

</p>


</div>

)

}