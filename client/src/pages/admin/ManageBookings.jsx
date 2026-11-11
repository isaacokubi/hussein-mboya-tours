/**
 * Purpose: Manage Bookings page-level UI component. Main declarations: ManageBookings, Card.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
useQuery,
useMutation,
useQueryClient
} from "@tanstack/react-query";

// Load ../../api/adminBookingApi so this module can use its exported dependencies.
import {
getBookings,
updateBookingStatus
} from "../../api/adminBookingApi";


// Define ManageBookings; its parameters and body implement this operation.
export default function ManageBookings(){

// Declare queryClient for use by the surrounding module or function.
const queryClient = useQueryClient();


// Declare { data, isLoading } for use by the surrounding module or function.
const {
data,
isLoading
}=useQuery({

queryKey:["admin-bookings"],

queryFn:getBookings

});


// Declare statusMutation for use by the surrounding module or function.
const statusMutation = useMutation({

mutationFn:({id,status})=>
updateBookingStatus(id,status),

onSuccess:()=>{
// Perform the side effect or state update expressed on the following line.
queryClient.invalidateQueries(
["admin-bookings"]
);
}

});


// Declare bookings for use by the surrounding module or function.
const bookings =
data?.data ||
data?.bookings ||
data ||
[];



// Check the condition (isLoading) and run the matching branch.
if(isLoading){

// Return the expression shown below to the caller.
return (

<div className="p-8">
Loading bookings...
</div>

)

}



// Return the expression shown below to the caller.
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
(Array.isArray(bookings) ? bookings : []).map((booking)=>(

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



// Define Card; its parameters and body implement this operation.
function Card({title,value}){

// Return the expression shown below to the caller.
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
