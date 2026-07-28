import {
useQuery
}
from "@tanstack/react-query";


import {
getBookings,
updateBooking
}
from "../../api/adminBookingApi";



export default function ManageBookings(){


const {
data:bookings=[]
}
=
useQuery({

queryKey:[
"bookings"
],

queryFn:
getBookings

});





return (

<div>


<h1 className="
text-3xl
font-bold
mb-8
">

Customer Bookings

</h1>



<div className="
bg-white
rounded-xl
shadow
p-6
">


{
bookings.map(item=>(


<div

key={item._id}

className="
border-b
py-5
flex
justify-between
"

>


<div>

<h3 className="font-bold">

{item.fullName}

</h3>


<p>

{item.tour?.title}

</p>


<p>

M-Pesa:
{item.paymentStatus}

</p>

</div>




<select

value={item.bookingStatus}

onChange={
e=>
updateBooking(
item._id,
e.target.value
)
}

>

<option>
pending
</option>


<option>
confirmed
</option>


<option>
cancelled
</option>


</select>



</div>


))
}



</div>



</div>

)

}