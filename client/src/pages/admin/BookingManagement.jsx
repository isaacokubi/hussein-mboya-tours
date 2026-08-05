
import React from "react";
import {useQuery} from "@tanstack/react-query";
import {getBookings} from "../../api/adminBookingApi";


const BookingManagement=()=>{


const {
data,
isLoading,
error
}=useQuery({

queryKey:["admin-bookings"],

queryFn:getBookings

});



if(isLoading)
return <div className="p-6">Loading bookings...</div>



if(error)
return <div className="p-6 text-red-500">
Failed loading bookings
</div>



const bookings=data?.data || data || [];



return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">
Booking Management
</h1>



<div className="bg-white rounded-xl shadow p-6 overflow-x-auto">


<table className="w-full">


<thead>

<tr className="border-b">

<th className="p-3 text-left">
ID
</th>

<th className="p-3 text-left">
Customer
</th>

<th className="p-3 text-left">
Tour
</th>

<th className="p-3 text-left">
Amount
</th>

<th className="p-3 text-left">
Payment
</th>

<th className="p-3 text-left">
Status
</th>

</tr>

</thead>



<tbody>


{
(Array.isArray(bookings) ? bookings : []).map((b)=>(

<tr
key={b._id}
className="border-b"
>


<td className="p-3">
{b._id?.slice(-6)}
</td>


<td className="p-3">

{
b.customer?.name ||
b.user?.name ||
"Unknown"
}

</td>


<td className="p-3">

{
b.tour?.title ||
b.tour?.name ||
"Unknown"
}

</td>


<td className="p-3">

KES {b.amount || 0}

</td>


<td className="p-3">

{
b.paymentStatus || "Pending"
}

</td>


<td className="p-3">

{
b.status || "Pending"
}

</td>


</tr>

))

}


</tbody>


</table>


</div>


</div>

)

}


export default BookingManagement;
