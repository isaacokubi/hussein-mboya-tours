import React from "react";
import {useQuery} from "@tanstack/react-query";
import {getAllBookings} from "../../api/bookingApi";


const BookingManagement = ()=>{


const {
data,
isLoading,
error

}=useQuery({

queryKey:["admin-bookings"],

queryFn:getAllBookings

});



if(isLoading)
return (
<div className="p-6">
Loading bookings...
</div>
);



if(error)
return (
<div className="p-6 text-red-500">
Failed to load bookings
</div>
);



const bookings =
data?.data ||
data ||
[];



return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">
Booking Management
</h1>



<div className="bg-white shadow rounded-xl p-6">


<table className="w-full">


<thead>

<tr className="border-b">

<th className="text-left p-3">
ID
</th>

<th className="text-left p-3">
Customer
</th>

<th className="text-left p-3">
Tour
</th>

<th className="text-left p-3">
Amount
</th>

<th className="text-left p-3">
Payment
</th>

<th className="text-left p-3">
Status
</th>


</tr>

</thead>



<tbody>


{
bookings.map((booking)=>(


<tr
key={booking._id}
className="border-b"
>


<td className="p-3">

{booking._id.slice(-6)}

</td>


<td className="p-3">

{
booking.customer?.name ||
booking.user?.name ||
"N/A"
}

</td>



<td className="p-3">

{
booking.tour?.title ||
booking.tour?.name ||
"N/A"
}

</td>



<td className="p-3">

KES {booking.amount || 0}

</td>



<td className="p-3">

{
booking.paymentStatus || "Pending"
}

</td>



<td className="p-3">

{
booking.status || "Pending"
}

</td>


</tr>


))

}



</tbody>


</table>


</div>


</div>

);


};


export default BookingManagement;