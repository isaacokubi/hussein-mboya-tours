// src/pages/CustomerDashboard.jsx


import {
  useEffect
} from "react";


import {
  useQuery,
  useQueryClient
} from "@tanstack/react-query";


import {
  Link
} from "react-router-dom";


import {
  getMyBookings
} from "../api/bookingApi";


import {
  useAuth
} from "../context/AuthContext";





const CustomerDashboard = () => {



const {
  user
} = useAuth();



const queryClient =
useQueryClient();






/*
|--------------------------------------------------------------------------
| Refresh only current user's bookings
|--------------------------------------------------------------------------
*/


useEffect(()=>{


if(user?._id){


queryClient.invalidateQueries({

queryKey:[
"my-bookings",
user._id
]

});


}


},[
user?._id,
queryClient
]);








/*
|--------------------------------------------------------------------------
| Fetch Customer Bookings
|--------------------------------------------------------------------------
*/


const {

data,
isLoading,
error

}=useQuery({


queryKey:[

"my-bookings",

user?._id

],



queryFn:getMyBookings,



enabled:
!!user,



staleTime:
1000 * 60 * 5,



gcTime:
1000 * 60 * 15,



refetchOnWindowFocus:true


});









if(isLoading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
">


<h2 className="
text-xl
font-semibold
">

Loading your travel dashboard...

</h2>


</div>

);

}









if(error){


return (

<div className="
min-h-screen
flex
items-center
justify-center
text-red-600
font-semibold
">

Failed to load bookings.

</div>

);


}








const bookings =
Array.isArray(data)
?
data
:
[];








const today =
new Date();








const totalTrips =
bookings.length;








const upcomingTrips =

bookings.filter((booking)=>{


const travelDate =
new Date(
booking.travelDate
);



return (

travelDate >= today &&

booking.bookingStatus
?.toLowerCase()

!=="cancelled"

);


}).length;








const completedTrips =

bookings.filter((booking)=>{


return (

booking.bookingStatus
?.toLowerCase()

==="completed"

);


}).length;








const cancelledTrips =

bookings.filter((booking)=>{


return (

booking.bookingStatus
?.toLowerCase()

==="cancelled"

);


}).length;









const totalSpent =

bookings.reduce(

(total,booking)=>


total +

Number(
booking.amount || 0
)


,

0

);









return (

<div className="
min-h-screen
bg-gray-100
p-4
md:p-8
">








{/* HERO SECTION */}



<div className="
bg-gradient-to-r
from-green-900
to-green-600
text-white
rounded-2xl
shadow-xl
p-8
mb-8
">



<h1 className="
text-3xl
font-bold
">

Welcome back,
{" "}
{user?.name}

</h1>




<p className="
mt-2
">

Your Hussein Mboya Tours customer centre

</p>





<div className="
mt-6
flex
gap-4
flex-wrap
">


<Link

to="/tours"

className="
bg-white
text-green-700
px-6
py-3
rounded-lg
font-bold
"

>

Book New Adventure

</Link>





<Link

to="/profile"

className="
bg-yellow-500
text-white
px-6
py-3
rounded-lg
font-bold
"

>

My Profile

</Link>



</div>



</div>









{/* STATISTICS */}



<div className="
grid
sm:grid-cols-2
lg:grid-cols-4
gap-6
mb-10
">



<StatCard

title="Total Trips"

value={totalTrips}

/>




<StatCard

title="Upcoming Trips"

value={upcomingTrips}

/>





<StatCard

title="Completed Trips"

value={completedTrips}

/>





<StatCard

title="Cancelled Trips"

value={cancelledTrips}

/>




</div>









{/* CUSTOMER SUMMARY */}



<div className="
bg-white
rounded-xl
shadow
p-6
mb-10
">



<h2 className="
text-2xl
font-bold
mb-6
">

Travel Summary

</h2>





<div className="
grid
md:grid-cols-3
gap-6
">





<div>


<p className="
text-gray-500
">

Total Booking Value

</p>



<h3 className="
text-2xl
font-bold
">

KES {totalSpent.toLocaleString("en-US")}

</h3>



</div>







<div>


<p className="
text-gray-500
">

Email

</p>



<h3 className="
font-semibold
">

{user?.email}

</h3>


</div>







<div>


<p className="
text-gray-500
">

Member Since

</p>



<h3 className="
font-semibold
">

{

user?.createdAt

?

new Date(
user.createdAt
)
.toDateString()

:

"N/A"

}

</h3>


</div>





</div>


</div>









{/* BOOKINGS LIST */}



<div className="
bg-white
rounded-xl
shadow
p-6
">





<div className="
flex
justify-between
items-center
mb-6
">


<h2 className="
text-2xl
font-bold
">

My Adventures

</h2>




<Link

to="/bookings"

className="
text-green-600
font-semibold
"

>

View All

</Link>



</div>








{

bookings.length === 0

?

(

<div className="
text-center
py-10
">


<p className="
text-gray-500
mb-5
">

You have no bookings yet.

</p>




<Link

to="/tours"

className="
bg-green-600
text-white
px-6
py-3
rounded-lg
"

>

Explore Tours

</Link>



</div>

)


:

(


<div className="
space-y-6
">


{

bookings.map((booking)=>(



<div

key={booking._id}

className="
border
rounded-xl
p-6
hover:shadow-lg
transition
"


>





<div className="
flex
justify-between
flex-wrap
gap-4
">



<div>


<h3 className="
text-xl
font-bold
">

{

booking.tour?.title ||

"Tour Package"

}

</h3>



<p>

Booking ID:

<b>

{" "}

{

booking._id.slice(-8)

}

</b>

</p>


</div>







<span className="
bg-yellow-100
px-4
py-2
rounded-full
capitalize
">

{

booking.bookingStatus ||

"pending"

}


</span>





</div>







<hr className="
my-5
"/>








<div className="
grid
md:grid-cols-2
gap-5
">





<p>

<strong>
Travel Date:
</strong>

{" "}

{

booking.travelDate

?

new Date(
booking.travelDate
)
.toDateString()

:

"N/A"

}


</p>





<p>

<strong>
Travellers:
</strong>

{" "}

{

booking.travelers?.length || 1

}


</p>





<p>

<strong>
Payment:
</strong>

{" "}

{

booking.paymentStatus ||

"pending"

}


</p>






<p>

<strong>
Amount:
</strong>

KES{" "}

{

Number(
booking.amount || 0
)
.toLocaleString("en-US")

}


</p>






</div>









<div className="
mt-6
flex
gap-4
flex-wrap
">





<Link

to={`/bookings/${booking._id}`}

className="
bg-black
text-white
px-5
py-2
rounded-lg
"

>

View Booking

</Link>







{

booking.paymentStatus
?.toLowerCase()

!=="paid"

&&

(

<Link

to={`/payment-status/${booking._id}`}

className="
bg-green-600
text-white
px-5
py-2
rounded-lg
"

>

Complete Payment

</Link>

)


}





</div>






</div>



))


}


</div>


)


}



</div>





</div>


);


};









function StatCard({
title,
value
}){


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<p className="
text-gray-500
">

{title}

</p>



<h2 className="
text-4xl
font-bold
mt-2
">

{value}

</h2>


</div>


);


}






export default CustomerDashboard;