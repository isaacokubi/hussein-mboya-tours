import { useEffect } from "react";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import {
  getMyBookings,
} from "../api/bookingApi";

import {
  useAuth,
} from "../context/AuthContext";


const CustomerDashboard = () => {

  const {
    user,
  } = useAuth();


  const queryClient =
    useQueryClient();



  useEffect(() => {

    if(user?._id){

      queryClient.invalidateQueries({

        queryKey:["my-bookings"]

      });

    }

  },[
    user?._id,
    queryClient
  ]);




  const {
    data,
    isLoading,
    error,

  } = useQuery({

    queryKey:["my-bookings"],


    queryFn:getMyBookings,


    enabled:
      !!user?._id,


    staleTime:
      1000 * 60 * 5,


    gcTime:
      1000 * 60 * 15,

  });



  console.log(
    "CUSTOMER BOOKINGS RESPONSE:",
    data
  );



  if(isLoading){

    return (

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
      ">

        Loading your travel dashboard...

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
      ">

        Failed loading customer dashboard.

      </div>

    );

  }



  /*
  |--------------------------------------------------------------------------
  | NORMALIZE API RESPONSE
  |--------------------------------------------------------------------------
  */


  const bookings =
    Array.isArray(data)

      ? data

      : data?.data?.bookings ||
        data?.bookings ||
        [];




  const totalTrips =
    bookings.length;



  const upcomingTrips =
    bookings.filter((booking)=>{

      const date =
        new Date(
          booking.travelDate
        );


      return (

        date >= new Date()

        &&

        (
          booking.bookingStatus ||
          booking.status ||
          ""
        )
        .toLowerCase()
        !==
        "cancelled"

      );

    }).length;



  const completedTrips =
    bookings.filter(
      booking =>
      (
        booking.bookingStatus ||
        booking.status ||
        ""
      )
      .toLowerCase()
      ===
      "completed"

    ).length;




  const cancelledTrips =
    bookings.filter(
      booking =>
      (
        booking.bookingStatus ||
        booking.status ||
        ""
      )
      .toLowerCase()
      ===
      "cancelled"

    ).length;




  const totalSpent =
    bookings.reduce(

      (total,booking)=>

        total +

        Number(

          booking.totalAmount ||

          booking.amount ||

          booking.subtotal ||

          0

        ),


      0

    );





return (

<div className="
min-h-screen
bg-gray-100
p-6
md:p-8
">



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

Welcome back,{" "}
{user?.name || "Traveller"}

</h1>


<p className="mt-2">

Your Coherent Tours customer centre

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
">

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
">

My Profile

</Link>


</div>


</div>






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


<SummaryItem

title="Total Booking Value"

value={
`KES ${totalSpent.toLocaleString()}`
}

/>


<SummaryItem

title="Email"

value={
user?.email || "-"
}

/>


<SummaryItem

title="Member Since"

value={

user?.createdAt

?

new Date(
user.createdAt
)
.toDateString()

:

"-"

}

/>


</div>


</div>









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

to="/my-bookings"

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


:


<div className="
space-y-5
">


{
bookings.map(
(booking)=>(


<div

key={booking._id}

className="
border
rounded-xl
p-6
"

>


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

Booking Number:{" "}

{

booking.bookingNumber ||

booking._id?.slice(-8) ||

"N/A"

}

</p>




<p>

Travel Date:{" "}

{

booking.travelDate

?

new Date(
booking.travelDate
)
.toLocaleDateString()

:

"N/A"

}

</p>





<p className="mt-3">

Status:{" "}

{

booking.bookingStatus ||

booking.status ||

"Pending"

}

</p>




<p>

Amount: KES{" "}

{

Number(

booking.totalAmount ||

booking.amount ||

0

)
.toLocaleString()

}

</p>





<Link

to={`/bookings/${booking._id}`}

className="
inline-block
mt-5
bg-black
text-white
px-5
py-2
rounded-lg
"

>

View Booking

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





function SummaryItem({
title,
value
}){

return (

<div>

<p className="
text-gray-500
">

{title}

</p>


<h3 className="
font-semibold
text-lg
">

{value}

</h3>


</div>

);

}




export default CustomerDashboard;