import useAgentBookings
from "../../hooks/useAgentBookings";



export default function AgentBookings(){


const {

data,

isLoading

}

=
useAgentBookings();



if(isLoading)

return <div>
Loading bookings...
</div>



return (

<div>


<h1
className="
text-2xl
font-bold
mb-6
">

My Bookings

</h1>



<div
className="
bg-white
rounded-xl
shadow
overflow-hidden
"
>


<table
className="
w-full
"
>


<thead>

<tr
className="
border-b
"
>

<th>
Customer
</th>


<th>
Tour
</th>


<th>
Amount
</th>


<th>
Status
</th>


</tr>

</thead>



<tbody>


{

data.map((booking)=>(


<tr
key={booking._id}
className="
border-b
"
>


<td>

{
booking.customer.name
}

</td>



<td>

{
booking.tourPackage.title
}

</td>



<td>

KES {booking.totalAmount.toLocaleString()}

</td>



<td>

{
booking.bookingStatus
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