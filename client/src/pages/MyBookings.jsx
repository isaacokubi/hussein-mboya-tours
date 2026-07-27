import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  getMyBookings
} from "../api/bookingApi";



export default function MyBookings(){


const {
data: bookings=[],
isLoading,
error

}=useQuery({

queryKey:[
"my-bookings"
],

queryFn:getMyBookings

});





if(isLoading){

return(

<div className="
min-h-screen
flex
items-center
justify-center
">

<div className="
text-center
">

<div className="
animate-spin
h-10
w-10
border-4
border-green-600
border-t-transparent
rounded-full
mx-auto
mb-4
">

</div>


<p className="
text-xl
font-semibold
">

Loading your adventures...

</p>


</div>

</div>

);

}





if(error){

return(

<div className="
p-10
text-center
text-red-600
">

Unable to load your travel bookings.

</div>

);

}





const upcomingTrips =
bookings.filter(
booking =>
booking.travelDate &&
new Date(booking.travelDate)>=new Date()
);



const paidTrips =
bookings.filter(
booking =>
booking.paymentStatus==="completed"
);



return(

<div className="
min-h-screen
bg-gray-100
p-6
">





{/* HEADER */}


<div className="
max-w-7xl
mx-auto
bg-gradient-to-r
from-green-800
to-yellow-600
rounded-3xl
p-8
text-white
shadow-xl
mb-8
">


<h1 className="
text-4xl
font-bold
">

My Adventures

</h1>



<p className="
mt-3
text-lg
">

Manage your Hussein Mboya Tours journeys,
payments and travel documents.

</p>


</div>









{/* SUMMARY CARDS */}


<div className="
max-w-7xl
mx-auto
grid
md:grid-cols-3
gap-6
mb-10
">



<div className="
bg-white
rounded-2xl
shadow
p-6
">

<p className="
text-gray-500
">

Total Bookings

</p>


<h2 className="
text-4xl
font-bold
">

{bookings.length}

</h2>


</div>





<div className="
bg-white
rounded-2xl
shadow
p-6
">


<p className="
text-gray-500
">

Upcoming Trips

</p>


<h2 className="
text-4xl
font-bold
text-green-600
">

{upcomingTrips.length}

</h2>


</div>





<div className="
bg-white
rounded-2xl
shadow
p-6
">


<p className="
text-gray-500
">

Paid Trips

</p>


<h2 className="
text-4xl
font-bold
text-blue-600
">

{paidTrips.length}

</h2>


</div>



</div>









{/* EMPTY STATE */}


{
bookings.length===0 &&

(

<div className="
max-w-5xl
mx-auto
bg-white
rounded-2xl
shadow
p-10
text-center
">


<h2 className="
text-3xl
font-bold
mb-4
">

No Adventures Yet

</h2>



<p className="
text-gray-600
mb-6
">

Start exploring Kenya's best destinations.

</p>



<Link
to="/tours"
className="
bg-green-700
text-white
px-8
py-3
rounded-xl
font-bold
"
>

Explore Tours

</Link>


</div>

)

}









{/* BOOKINGS LIST */}


<div className="
max-w-7xl
mx-auto
space-y-6
">


{

bookings.map(
booking=>(


<div
key={booking._id}
className="
bg-white
rounded-2xl
shadow
p-6
hover:shadow-xl
transition
"
>




<div className="
flex
justify-between
flex-wrap
gap-5
">



<div>


<h2 className="
text-2xl
font-bold
text-green-800
">

{
booking.tour?.title ||
"Tour Package"
}

</h2>




<p className="
text-gray-600
mt-2
">

Booking Number:

<span className="
font-bold
">

{" "}

{
booking.bookingNumber ||
booking._id.slice(-8)
}

</span>


</p>





<p className="
text-gray-600
">

Travel Date:

{" "}

{

booking.travelDate

?

new Date(
booking.travelDate
)
.toDateString()

:

"Not Selected"

}


</p>




<p className="
text-gray-600
">

Destination:

{" "}

{

booking.destination?.name ||

booking.tour?.destination?.name ||

booking.tour?.destination ||

"N/A"

}


</p>





<p className="
text-gray-600
">

Travellers:

{" "}

{

booking.travelers?.length ||
1

}

</p>


</div>







<div className="
flex
flex-col
gap-3
items-end
">





<span
className={`
px-4
py-2
rounded-full
font-bold
capitalize

${
booking.bookingStatus==="completed"

?

"bg-green-100 text-green-700"

:

booking.bookingStatus==="cancelled"

?

"bg-red-100 text-red-700"

:

"bg-yellow-100 text-yellow-700"

}

`}
>


{
booking.bookingStatus ||
"pending"
}


</span>






<span
className={`
px-4
py-2
rounded-full
font-bold
capitalize

${
booking.paymentStatus==="completed"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}

`}
>


Payment:

{" "}

{
booking.paymentStatus ||
"pending"
}


</span>




</div>



</div>









<hr className="
my-6
"/>







<div className="
flex
justify-between
flex-wrap
gap-4
">





<div>


<p className="
text-gray-500
">

Booking Amount

</p>


<h3 className="
text-xl
font-bold
">

KES {

Number(
booking.amount || 0
)
.toLocaleString()

}

</h3>


</div>








<div className="
flex
gap-3
flex-wrap
">



<Link

to={`/bookings/${booking._id}`}

className="
bg-green-700
text-white
px-5
py-2
rounded-xl
"
>

View Trip

</Link>






<Link

to={`/bookings/${booking._id}`}

className="
bg-yellow-600
text-white
px-5
py-2
rounded-xl
"
>

Invoice

</Link>







{
booking.paymentStatus !== "completed"
&&

(

<Link

to={`/payment-status/${booking._id}`}

className="
bg-black
text-white
px-5
py-2
rounded-xl
"
>

Pay Now

</Link>

)

}





</div>



</div>






</div>


)

)

}



</div>








{/* SUPPORT SECTION */}


<div className="
max-w-7xl
mx-auto
mt-10
bg-blue-900
text-white
rounded-2xl
p-8
">


<h2 className="
text-2xl
font-bold
">

Need Help With Your Trip?

</h2>


<p className="
mt-2
">

Our Hussein Mboya Tours team is ready to assist
with payments, changes and travel information.

</p>



<Link
to="/contact"
className="
inline-block
mt-5
bg-yellow-500
text-black
px-6
py-3
rounded-xl
font-bold
"
>

Contact Support

</Link>


</div>





</div>


);

}