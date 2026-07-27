import {
    useQuery
} from "@tanstack/react-query";

import {
    Link,
    Navigate
} from "react-router-dom";


import {
    getMyBookings
} from "../api/bookingApi";


import {
    useAuth
} from "../context/AuthContext";





export default function Dashboard(){


const {
    user
} = useAuth();







/*
|--------------------------------------------------------------------------
| ROLE REDIRECTS
|--------------------------------------------------------------------------
*/


const role =
user?.role?.name ||
user?.role;





if(
role === "tourguide" ||
role === "tour_guide"
){

return (

<Navigate
to="/guide/dashboard"
replace
/>

);

}





if(
role === "tourmanager" ||
role === "tour_manager"
){

return (

<Navigate
to="/tour-manager/dashboard"
replace
/>

);

}





if(
role === "agent"
){

return (

<Navigate
to="/agent"
replace
/>

);

}





if(
role === "admin"
){

return (

<Navigate
to="/admin"
replace
/>

);

}








/*
|--------------------------------------------------------------------------
| LOAD BOOKINGS
|--------------------------------------------------------------------------
*/


const {

data,

isLoading,

error

}=useQuery({

queryKey:[

"my-bookings"

],


queryFn:getMyBookings

});








/*
|--------------------------------------------------------------------------
| SAFE DATA EXTRACTION
|--------------------------------------------------------------------------
*/


const bookings =

Array.isArray(data)

?

data

:

data?.bookings || [];









if(isLoading){

return (

<div
className="
min-h-screen
flex
items-center
justify-center
"
>

<h2
className="
text-xl
font-bold
"
>

Loading dashboard...

</h2>


</div>

);

}







if(error){

return (

<div
className="
p-10
text-center
text-red-600
"
>

Unable to load dashboard.

</div>

);

}








/*
|--------------------------------------------------------------------------
| DASHBOARD CALCULATIONS
|--------------------------------------------------------------------------
*/


const today =
new Date();





const upcomingTrips =

bookings.filter(

booking=>

booking.travelDate &&

new Date(
booking.travelDate
)

>=

today &&

booking.bookingStatus !==
"cancelled"

);







const completedTrips =

bookings.filter(

booking=>

booking.bookingStatus ===
"completed"

);







const cancelledTrips =

bookings.filter(

booking=>

booking.bookingStatus ===
"cancelled"

);







const totalSpent =

bookings.reduce(

(total,booking)=>

total +

Number(
booking.amount || 0
),

0

);







const nextTrip =
upcomingTrips[0];








return (

<div
className="
min-h-screen
bg-gray-100
p-6
"
>





{/* HEADER */}

<div
className="
bg-gradient-to-r
from-yellow-600
via-green-700
to-green-900
rounded-3xl
text-white
p-8
shadow-xl
mb-8
"
>


<h1
className="
text-4xl
font-bold
"
>

Welcome back,
{" "}
{user?.name || "Traveller"}

</h1>



<p
className="
mt-3
text-lg
"
>

Manage your adventures with Hussein Mboya Tours.

</p>



<div
className="
flex
gap-4
mt-6
"
>


<Link

to="/tours"

className="
bg-white
text-green-700
px-6
py-3
rounded-xl
font-bold
"

>

Explore Tours

</Link>




<Link

to="/bookings"

className="
bg-black/40
px-6
py-3
rounded-xl
font-bold
"

>

My Bookings

</Link>



</div>


</div>








{/* STAT CARDS */}


<div
className="
grid
md:grid-cols-4
gap-6
"
>


<Card
title="Total Trips"
value={bookings.length}
/>



<Card
title="Upcoming Adventures"
value={upcomingTrips.length}
/>



<Card
title="Completed Trips"
value={completedTrips.length}
/>



<Card
title="Cancelled Trips"
value={cancelledTrips.length}
/>


</div>








{/* TOTAL SPENT */}


<div
className="
bg-white
rounded-2xl
shadow
p-6
mt-6
"
>

<p
className="
text-gray-500
"
>

Total Spent

</p>



<h2
className="
text-3xl
font-bold
"
>

KES {totalSpent.toLocaleString()}

</h2>


</div>









{/* NEXT TRIP */}


{
nextTrip &&

<div
className="
bg-white
rounded-2xl
shadow
p-8
mt-8
"
>


<h2
className="
text-3xl
font-bold
mb-5
"
>

Next Adventure

</h2>



<div
className="
bg-green-50
rounded-xl
p-6
"
>


<h3
className="
text-2xl
font-bold
"
>

{
nextTrip.tour?.title ||
"Tour Package"
}

</h3>



<p>

Travel Date:

{" "}

{

new Date(
nextTrip.travelDate
)

.toDateString()

}

</p>




<p>

Payment:

{" "}

<b>

{
nextTrip.paymentStatus
}

</b>

</p>



</div>



</div>

}









{/* BOOKINGS */}


<div
className="
bg-white
rounded-2xl
shadow
p-8
mt-10
"
>


<div
className="
flex
justify-between
mb-6
"
>


<h2
className="
text-3xl
font-bold
"
>

Recent Bookings

</h2>



<Link

to="/bookings"

className="
text-green-700
font-bold
"

>

View All

</Link>



</div>







{
bookings.length === 0 ?


<p
className="
text-center
p-10
"
>

No bookings available.

</p>



:


<div
className="
space-y-5
"
>


{

bookings
.slice(0,5)
.map(

booking=>(


<div

key={
booking._id
}

className="
border
rounded-xl
p-5
flex
justify-between
"

>


<div>


<h3
className="
font-bold
text-xl
"
>

{
booking.tour?.title ||
"Tour"
}

</h3>



<p>

Date:

{" "}

{

booking.travelDate ?

new Date(
booking.travelDate
)

.toDateString()

:

"N/A"

}

</p>



<p>

Status:

{" "}

<b>

{
booking.bookingStatus
}

</b>

</p>


</div>




<Link

to={`/bookings/${booking._id}`}

className="
bg-green-700
text-white
px-5
py-2
rounded-lg
"

>

View

</Link>



</div>


)

)



}


</div>


}


</div>





</div>

);


}









/*
|--------------------------------------------------------------------------
| STAT CARD COMPONENT
|--------------------------------------------------------------------------
*/


function Card({
title,
value
}){


return (

<div
className="
bg-white
rounded-2xl
shadow
p-6
"
>


<p
className="
text-gray-500
"
>

{title}

</p>



<h2
className="
text-4xl
font-bold
"
>

{value}

</h2>


</div>

);


}