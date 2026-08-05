
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getBookings,
  updateBookingStatus,
  updateBookingPayment
} from "../../api/adminBookingApi";


const BookingManagement = () => {


const queryClient = useQueryClient();


const {
data,
isLoading,
error
}=useQuery({

queryKey:["admin-bookings"],

queryFn:getBookings

});



const statusMutation = useMutation({

mutationFn:({id,status}) =>
updateBookingStatus(id,status),

onSuccess:()=>{
queryClient.invalidateQueries([
"admin-bookings"
]);
}

});



const paymentMutation = useMutation({

mutationFn:({id,status}) =>
updateBookingPayment(
id,
{
paymentStatus:status
}
),

onSuccess:()=>{
queryClient.invalidateQueries([
"admin-bookings"
]);
}

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
Failed loading bookings
</div>
);



const bookings =
Array.isArray(data)
? data
: data?.bookings || [];




const total =
bookings.length;


const pending =
bookings.filter(
b=>b.status==="pending"
).length;


const confirmed =
bookings.filter(
b=>b.status==="confirmed"
).length;


const paid =
bookings.filter(
b=>b.paymentStatus==="paid"
).length;



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Booking Management
</h1>



<div className="grid md:grid-cols-4 gap-4">


<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500">
Total Bookings
</p>

<h2 className="text-3xl font-bold">
{total}
</h2>

</div>



<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500">
Pending
</p>

<h2 className="text-3xl font-bold">
{pending}
</h2>

</div>



<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500">
Confirmed Trips
</p>

<h2 className="text-3xl font-bold">
{confirmed}
</h2>

</div>



<div className="bg-white shadow rounded-xl p-5">
<p className="text-gray-500">
Paid
</p>

<h2 className="text-3xl font-bold">
{paid}
</h2>

</div>


</div>





<div className="bg-white rounded-xl shadow overflow-x-auto">


<table className="w-full">


<thead>

<tr className="border-b bg-gray-50">

<th className="p-3 text-left">
Booking
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

<th className="p-3 text-left">
Actions
</th>

</tr>

</thead>



<tbody>


{
bookings.map((b)=>(


<tr
key={b._id}
className="border-b"
>


<td className="p-3">
#{b._id?.slice(-6)}
</td>



<td className="p-3">

{
b.customer?.name ||
b.user?.name ||
b.user?.firstName ||
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

KES {b.amount || b.totalAmount || b.subtotal || 0}

</td>




<td className="p-3">

<span>
{b.paymentStatus || "pending"}
</span>

</td>




<td className="p-3">

<span>
{b.status || "pending"}
</span>

</td>




<td className="p-3 space-x-2">


<button

onClick={()=>
statusMutation.mutate({

id:b._id,

status:"confirmed"

})
}

className="px-3 py-1 bg-green-600 text-white rounded"

>

Confirm

</button>



<button

onClick={()=>
paymentMutation.mutate({

id:b._id,

status:"paid"

})
}

className="px-3 py-1 bg-blue-600 text-white rounded"

>

Mark Paid

</button>


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
