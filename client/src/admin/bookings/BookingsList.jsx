import {
useQuery
}
from "@tanstack/react-query";


import axios from "axios";



export default function BookingsList(){



const {

data,

isLoading

}=useQuery({


queryKey:[

"adminBookings"

],



queryFn:async()=>{


const response =
await axios.get(


`${import.meta.env.VITE_API_URL}/api/admin/bookings`,

{

headers:{


Authorization:

`Bearer ${localStorage.getItem("token")}`


}


}


);



return response.data.bookings;


}



});




if(isLoading)

return <p>
Loading bookings...
</p>;




return (

<div
className="
p-6
"
>


<h1
className="
text-3xl font-bold mb-8
"
>

Bookings Management

</h1>



<table
className="
w-full bg-white shadow rounded
"
>


<thead>


<tr>

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
Payment
</th>


<th>
Status
</th>


</tr>


</thead>




<tbody>


{

data?.map(

booking=>(


<tr
key={booking._id}
>


<td>

{
booking.customer?.name
}

</td>



<td>

{
booking.tour?.name
}

</td>



<td>

KES {booking.totalAmount}

</td>




<td>

{
booking.paymentStatus
}

</td>




<td>

{
booking.bookingStatus
}

</td>



</tr>


)


)

}


</tbody>


</table>



</div>

);


}