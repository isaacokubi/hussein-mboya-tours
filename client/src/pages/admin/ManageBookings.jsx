import React from "react";
import {
useQuery,
useMutation,
useQueryClient
} from "@tanstack/react-query";

import {
getBookings,
updateBookingStatus,
updateBookingPayment
} from "../../api/adminBookingApi";


export default function ManageBookings(){

const queryClient = useQueryClient();


const {
data,
isLoading
}=useQuery({

queryKey:["admin-bookings"],

queryFn:getBookings

});


const statusMutation = useMutation({

mutationFn:({id,status})=>
updateBookingStatus(id,status),

onSuccess:()=>{
queryClient.invalidateQueries(
["admin-bookings"]
);
}

});


const paymentMutation = useMutation({

mutationFn:({id,payload})=>
updateBookingPayment(id,payload),

onSuccess:()=>{
queryClient.invalidateQueries(
["admin-bookings"]
);
}

});


const bookings =
data?.data ||
data?.bookings ||
data ||
[];



if(isLoading){

return (

<div className="p-8">
Loading bookings...
</div>

)

}



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Bookings Management
</h1>


<div className="
grid md:grid-cols-4 gap-5
">


<Card
title="Total Bookings"
value={bookings.length}
/>


<Card
title="Confirmed"
value={
bookings.filter(
b=>b.status==="confirmed"
).length
}
/>


<Card
title="Pending"
value={
bookings.filter(
b=>b.status==="pending"
).length
}
/>


<Card
title="Paid"
value={
bookings.filter(
b=>b.paymentStatus==="paid"
).length
}
/>


</div>



<div className="
bg-white rounded-xl shadow p-5
">


<table className="w-full">


<thead>

<tr className="border-b">

<th>Customer</th>
<th>Tour</th>
<th>Date</th>
<th>Payment</th>
<th>Status</th>
<th>Actions</th>

</tr>

</thead>



<tbody>


{
bookings.map((booking)=>(

<tr
key={booking._id}
className="border-b"
>


<td>

{
booking.customer?.name ||
booking.user?.name ||
"Guest"
}

</td>


<td>

{
booking.tour?.title ||
booking.tour?.name ||
"N/A"
}

</td>


<td>

{
new Date(
booking.createdAt
).toLocaleDateString()

}

</td>


<td>

<span>

{
booking.paymentStatus ||
"pending"
}

</span>


</td>



<td>

{
booking.status
}


</td>



<td className="space-x-2">


<button

onClick={()=>statusMutation.mutate({

id:booking._id,

status:"confirmed"

})}

className="
bg-green-600
text-white
px-3 py-1
rounded
"

>

Confirm

</button>



<button

onClick={()=>paymentMutation.mutate({

id:booking._id,

payload:{
paymentStatus:"paid"
}

})}

className="
bg-blue-600
text-white
px-3 py-1
rounded
"

>

Paid

</button>



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



function Card({title,value}){

return (

<div className="
bg-white
rounded-xl
shadow
p-5
">

<p className="text-gray-500">
{title}
</p>


<h2 className="text-3xl font-bold">
{value}
</h2>


</div>

)

}
