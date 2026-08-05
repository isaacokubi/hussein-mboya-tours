import React, { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import { getStaff } from "../../api/staffApi";
import { getVehicles } from "../../api/vehicleApi";


import {
  getBookings,
  updateBookingStatus,
  updateBookingPayment,
  assignBookingResources
} from "../../api/adminBookingApi";



const BookingManagement = () => {


const queryClient = useQueryClient();


const [selectedBooking,setSelectedBooking] = useState(null);


const [search,setSearch] = useState("");

const [statusFilter,setStatusFilter] = useState("all");

const [paymentFilter,setPaymentFilter] = useState("all");




/* STAFF */

const {
data:staffResponse
}=useQuery({

queryKey:["staff"],

queryFn:getStaff

});



const staff = Array.isArray(staffResponse)
?
staffResponse
:
Array.isArray(staffResponse?.data)
?
staffResponse.data
:
Array.isArray(staffResponse?.staff)
?
staffResponse.staff
:
[];


const guides = Array.isArray(staff)
?
staff.filter(
(s)=>
s &&
(
s.role==="tour_guide" ||
s.position?.toLowerCase().includes("guide")
)
)
:
[];


const drivers = Array.isArray(staff)
?
staff.filter(
(s)=>
s &&
(
s.role==="driver" ||
s.position?.toLowerCase().includes("driver")
)
)
:
[];




/* VEHICLES */

const {
data:vehicleResponse
}=useQuery({

queryKey:["vehicles"],

queryFn:getVehicles

});



const vehicles =
Array.isArray(vehicleResponse)
?
vehicleResponse
:
vehicleResponse?.data ||
vehicleResponse?.vehicles ||
[];





/* BOOKINGS */

const {
data,
isLoading,
error
}=useQuery({

queryKey:["admin-bookings"],

queryFn:getBookings

});





/* STATUS UPDATE */


const statusMutation = useMutation({

mutationFn:({id,status})=>
updateBookingStatus(id,status),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

}

});






/* PAYMENT */


const paymentMutation = useMutation({

mutationFn:({id,status})=>

updateBookingPayment(

id,

{
paymentStatus:status
}

),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

}

});






/* ASSIGN RESOURCES */


const assignMutation = useMutation({

mutationFn:({id,payload})=>

assignBookingResources(

id,

payload

),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

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
?
data
:
Array.isArray(data?.data)
?
data.data
:
Array.isArray(data?.bookings)
?
data.bookings
:
[];





const filteredBookings = bookings.filter((b)=>{

const customer =
b.customer?.name ||
b.user?.name ||
"";

const tour =
b.tour?.title ||
"";


const payment =
typeof b.paymentStatus==="string"
?
b.paymentStatus
:
b.paymentStatus?.status || "";


const matchesSearch =
customer.toLowerCase().includes(search.toLowerCase()) ||
tour.toLowerCase().includes(search.toLowerCase()) ||
b._id.includes(search);


const matchesStatus =
statusFilter==="all" ||
b.status===statusFilter;


const matchesPayment =
paymentFilter==="all" ||
payment===paymentFilter;


return (
matchesSearch &&
matchesStatus &&
matchesPayment
);

});


const total = bookings.length;



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
b=>
(
typeof b.paymentStatus==="string"
?
b.paymentStatus
:
b.paymentStatus?.status
)
==="paid"
).length;






return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">

Booking Management

</h1>





<div className="grid md:grid-cols-4 gap-4">


{
[
["Total Bookings",total],
["Pending",pending],
["Confirmed Trips",confirmed],
["Paid",paid]

].map(([title,value])=>(


<div
key={title}
className="bg-white shadow rounded-xl p-5"
>

<p>{title}</p>

<h2 className="text-3xl font-bold">

{value}

</h2>

</div>


))
}


</div>








<div className="grid md:grid-cols-3 gap-4 mb-5">


<input

value={search}

onChange={(e)=>setSearch(e.target.value)}

placeholder="Search customer, tour or booking ID"

className="border rounded px-3 py-2"

/>



<select

value={statusFilter}

onChange={(e)=>setStatusFilter(e.target.value)}

className="border rounded px-3 py-2"

>

<option value="all">
All Status
</option>

<option value="pending">
Pending
</option>

<option value="confirmed">
Confirmed
</option>

<option value="cancelled">
Cancelled
</option>

</select>




<select

value={paymentFilter}

onChange={(e)=>setPaymentFilter(e.target.value)}

className="border rounded px-3 py-2"

>

<option value="all">
All Payments
</option>

<option value="paid">
Paid
</option>

<option value="pending">
Pending
</option>

<option value="failed">
Failed
</option>

</select>


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
Guide
</th>


<th className="p-3 text-left">
Driver
</th>


<th className="p-3 text-left">
Vehicle
</th>


<th className="p-3 text-left">
Workflow
</th>


<th className="p-3 text-left">
Actions
</th>


</tr>

</thead>





<tbody>


{
(Array.isArray(filteredBookings) ? filteredBookings : []).map((b)=>(


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

KES {
b.amount ||
b.totalAmount ||
b.subtotal ||
0
}

</td>




<td className="p-3">

{
typeof b.paymentStatus==="string"
?
b.paymentStatus
:
b.paymentStatus?.status || "pending"
}

</td>




<td className="p-3">

{b.status || "pending"}

</td>




<td className="p-3">

{
b.guide?.name ||
b.guide?.firstName ||
b.assignedGuide?.name ||
b.assignedGuide?.firstName ||
"Not assigned"
}

</td>


<td className="p-3">

{
b.assignedDriver?.name ||
"Not assigned"
}

</td>


<td className="p-3">

{
b.vehicle?.registrationNumber ||
b.vehicle?.plateNumber ||
b.assignedVehicle?.registrationNumber ||
b.assignedVehicle?.plateNumber ||
"Not assigned"
}

</td>



<td className="p-3">

<select
className="px-2 py-1 border rounded"
value={b.status || "pending"}
onChange={(e)=>{

statusMutation.mutate({
id:b._id,
status:e.target.value
})

}}
>

<option value="pending">
Pending
</option>

<option value="confirmed">
Confirmed
</option>

<option value="assigned">
Assigned
</option>

<option value="ongoing">
Ongoing
</option>

<option value="completed">
Completed
</option>

<option value="cancelled">
Cancelled
</option>

<option value="refunded">
Refunded
</option>

</select>

</td>


<td className="p-3 space-x-2">




<select
className="px-2 py-1 border rounded"
value={
b.guide?._id ||
b.assignedGuide?._id ||
""
}
onChange={(e)=>{

if(e.target.value){

assignMutation.mutate({

id:b._id,

payload:{
  guide:e.target.value,
  driver:b.assignedDriver?._id || null,
  vehicle:b.assignedVehicle?._id || null
}

})

}

}}
>

<option value="">
Assign Guide
</option>


{
(Array.isArray(guides) ? guides : []).map(g=>(

<option
key={g._id}
value={g._id}
>

{g.firstName || g.lastName
? `${g.firstName || ""} ${g.lastName || ""}`
: g.name || "Guide"}

</option>

))
}

</select>








<select
className="px-2 py-1 border rounded"
value={
b.assignedDriver?._id || ""
}
onChange={(e)=>{

if(e.target.value){

assignMutation.mutate({

id:b._id,

payload:{
guide:b.assignedGuide?._id || null,
driver:e.target.value,
vehicle:b.assignedVehicle?._id || null
}

})

}

}}
>

<option value="">
Assign Driver
</option>

{
(Array.isArray(drivers) ? drivers : []).map(d=>(

<option
key={d._id}
value={d._id}
>
{d.name || "Driver"}

</option>

))
}

</select>



<select
className="px-2 py-1 border rounded"
defaultValue=""
onChange={(e)=>{

if(e.target.value){

assignMutation.mutate({

id:b._id,

payload:{
  guide:b.assignedGuide?._id || null,
  driver:b.assignedDriver?._id || null,
  vehicle:e.target.value
}

})

}

}}
>

<option value="">
Assign Vehicle
</option>


{
(Array.isArray(vehicles) ? vehicles : []).map(v=>(

<option
key={v._id}
value={v._id}
>

{v.name ||
v.registrationNumber ||
"Vehicle"}

</option>

))
}

</select>





</td>



</tr>


))

}


</tbody>


</table>


</div>








{
selectedBooking && (


<div className="fixed inset-0 bg-black/40 flex justify-end">


<div className="bg-white w-full md:w-96 h-full p-6 shadow-xl">


<h2 className="text-2xl font-bold mb-4">

Booking Details

</h2>




<p>
ID: {selectedBooking._id}
</p>




<p>
Customer:

{
selectedBooking.customer?.name ||
selectedBooking.user?.name ||
"Unknown"
}

</p>




<p>

Tour:

{
selectedBooking.tour?.title ||
"Unknown"
}

</p>




<p>

Amount:

KES {selectedBooking.amount || 0}

</p>




<p>

Payment:

{
selectedBooking.paymentStatus?.status ||
selectedBooking.paymentStatus ||
"pending"
}

</p>




<p>

Status:

{
selectedBooking.status
}

</p>




<p>

Payment Method:

{
selectedBooking.paymentMethod ||
"MPESA"
}

</p>




<p>

M-Pesa Receipt:

{
selectedBooking.mpesaReceiptNumber ||
selectedBooking.payment?.mpesaReceiptNumber ||
"Pending"
}

</p>




<p>

Phone:

{
selectedBooking.phone ||
selectedBooking.customer?.phone ||
selectedBooking.user?.phone ||
"Not available"
}

</p>




<p>

Payment Date:

{
selectedBooking.paymentDate ||
selectedBooking.updatedAt ||
"Pending"
}

</p>




<button

onClick={()=>setSelectedBooking(null)}

className="mt-5 px-4 py-2 bg-gray-800 text-white rounded"

>

Close

</button>



</div>


</div>


)

}




</div>

);


};



export default BookingManagement;