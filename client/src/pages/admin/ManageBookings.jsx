// client/src/pages/admin/ManageBookings.jsx


import {
useEffect,
useState
}
from "react";



import {

getAdminBookings,

updateBookingStatus

}
from "../../api/bookingApi";







export default function ManageBookings(){



const [bookings,setBookings] =

useState([]);




const [search,setSearch] =

useState("");




const [status,setStatus] =

useState("");




const [loading,setLoading] =

useState(false);









/*
|--------------------------------------------------------------------------
| LOAD BOOKINGS
|--------------------------------------------------------------------------
*/


const loadBookings = async()=>{


try{


setLoading(true);



const res =

await getAdminBookings({

search,

status

});




setBookings(

res.bookings || []

);



}

catch(error){


console.error(

"Failed loading bookings",

error

);


}

finally{


setLoading(false);


}



};









useEffect(()=>{


loadBookings();


},[status]);









/*
|--------------------------------------------------------------------------
| UPDATE STATUS
|--------------------------------------------------------------------------
*/


const changeStatus = async(

id,

newStatus

)=>{


try{


await updateBookingStatus(

id,

newStatus

);



loadBookings();



}

catch(error){


console.error(

"Status update failed",

error

);


}



};









return (

<div className="p-6">





<h1

className="
text-3xl
font-bold
mb-8
"

>

Booking Management

</h1>









<div

className="
flex
gap-4
mb-6
"

>



<input


className="
border
p-3
rounded
w-80
"


placeholder="
Search customer or booking number
"



value={search}



onChange={

e=>

setSearch(

e.target.value

)

}


/>







<button


onClick={loadBookings}



className="
bg-green-700
text-white
px-5
rounded
"

>

Search

</button>









<select


className="
border
p-3
rounded
"



value={status}



onChange={

e=>

setStatus(

e.target.value

)

}


>



<option value="">

All Status

</option>



<option value="pending">

Pending

</option>



<option value="confirmed">

Confirmed

</option>



<option value="completed">

Completed

</option>



<option value="cancelled">

Cancelled

</option>



</select>





</div>









<div

className="
bg-white
shadow
rounded-xl
overflow-hidden
"

>




{

loading ?



<div className="p-6">

Loading bookings...

</div>



:



<table

className="
w-full
"

>



<thead

className="
bg-gray-100
"

>



<tr>



<th className="p-4">

Booking

</th>



<th className="p-4">

Customer

</th>



<th className="p-4">

Tour

</th>



<th className="p-4">

Amount

</th>



<th className="p-4">

Payment

</th>



<th className="p-4">

Status

</th>



<th className="p-4">

Actions

</th>



</tr>



</thead>









<tbody>



{


bookings.map(booking=>(



<tr


key={booking._id}



className="
border-b
"

>



<td className="p-4">


<div className="font-semibold">


{

booking.bookingNumber ||

booking._id

}


</div>



</td>









<td className="p-4">



<div className="font-medium">


{

booking.customer?.name ||

booking.customerSnapshot?.name

}


</div>



<small>


{

booking.customer?.phone ||

booking.customerSnapshot?.phone

}


</small>



</td>









<td className="p-4">



{

booking.tour?.title ||

"Tour unavailable"

}



</td>









<td className="p-4">


KES {

booking.amount ||

booking.totalAmount ||

0

}



</td>









<td className="p-4">



<span

className="
bg-green-100
px-3
py-1
rounded
"

>


{

booking.paymentStatus

}



</span>



</td>









<td className="p-4">


<span>


{

booking.status ||

booking.bookingStatus

}



</span>



</td>









<td className="p-4 space-x-2">





<button



onClick={

()=>


changeStatus(

booking._id,

"confirmed"

)


}



className="
bg-green-700
text-white
px-3
py-1
rounded
"

>



Confirm



</button>









<button



onClick={

()=>


changeStatus(

booking._id,

"cancelled"

)


}



className="
bg-red-600
text-white
px-3
py-1
rounded
"

>



Cancel



</button>







</td>







</tr>



))



}




</tbody>







</table>



}



</div>





</div>

);


}