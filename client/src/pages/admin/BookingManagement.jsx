import React, { useState } from "react";
import { exportBookingsCSV } from "../../utils/exportBookings";

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
  assignBookingResources,
    exportBookings,
    sendBookingNotification,
  requestRefund
} from "../../api/adminBookingApi";



const BookingManagement = () => {


const queryClient = useQueryClient();


const [selectedBooking,setSelectedBooking] = useState(null);

const [actionBooking,setActionBooking]=useState(null);


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







/* REFUND */

const refundMutation = useMutation({

mutationFn:({id,payload})=>
refundBooking(id,payload),

onSuccess:()=>{
queryClient.invalidateQueries({
queryKey:["admin-bookings"]
});
}

});


/* NOTIFICATIONS */

const notificationMutation = useMutation({

mutationFn:({id,payload})=>
sendBookingNotification(id,payload),

});




/* ASSIGN RESOURCES */


/* CUSTOMER NOTIFICATION */

const notificationMutation = useMutation({

mutationFn: async(id)=>{

return {
success:true,
message:"Notification queued"
};

},

onSuccess:()=>{

alert("Customer notification sent");

}

});



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





const handleBookingAction=(action,b)=>{


if(action==="confirm"){

statusMutation.mutate({
id:b._id,
status:"confirmed"
});

}


if(action==="cancel"){

statusMutation.mutate({
id:b._id,
status:"cancelled"
});

}


if(action==="complete"){

statusMutation.mutate({
id:b._id,
status:"completed"
});

}


if(action==="refund"){

paymentMutation.mutate({
id:b._id,
status:"refunded"
});

}


if(action==="notify"){

notificationMutation.mutate(
b._id
);

}

};



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






const today =
new Date()
.toISOString()
.split("T")[0];


const todaysDepartures =
bookings.filter(
b=>
b.travelDate?.startsWith(today)
);


const unassignedPaid =
bookings.filter(
b=>
b.paymentStatus==="paid" &&
!b.assignedGuide
);


const guideWorkload={};


bookings.forEach(b=>{

const guide=b.assignedGuide?.name;

if(guide){

guideWorkload[guide]=
(guideWorkload[guide]||0)+1;

}

});



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


const cancelled =
bookings.filter(
b=>b.status==="cancelled"
).length;


const revenue =
bookings.reduce(
(sum,b)=>
sum+
Number(
b.totalAmount ||
b.amount ||
0
),
0
);


const upcoming =
bookings.filter(
b=>
new Date(b.travelDate)>new Date()
).length;


const tourCounts={};


bookings.forEach(b=>{

const name=b.tour?.title;

if(name){

tourCounts[name]=(tourCounts[name]||0)+1;

}

});


const mostBookedTour =
Object.entries(tourCounts)
.sort((a,b)=>b[1]-a[1])[0]?.[0]
||
"None";





const pending =
bookings.filter(
b=>b.status==="pending"
).length;



const confirmed =
bookings.filter(
b=>b.status==="confirmed"
).length;





const cancelled =
bookings.filter(
b=>b.status==="cancelled"
).length;


const revenue =
bookings.reduce(
(sum,b)=>
sum +
Number(
b.totalAmount ||
b.amount ||
0
),
0
);




const today =
new Date();

today.setHours(
0,0,0,0
);


const tomorrow =
new Date(today);

tomorrow.setDate(
tomorrow.getDate()+1
);



const todayDepartures =
bookings.filter(
b=>{

const date =
new Date(b.travelDate);

date.setHours(0,0,0,0);

return date.getTime()===today.getTime();

}

).length;



const tomorrowDepartures =
bookings.filter(
b=>{

const date =
new Date(b.travelDate);

date.setHours(0,0,0,0);

return date.getTime()===tomorrow.getTime();

}

).length;




const unassignedPaidBookings =
bookings.filter(
b=>

b.paymentStatus==="paid" &&
!b.assignedGuide &&
!b.assignedVehicle

).length;



const guideWorkload =
Object.entries(

bookings.reduce(
(acc,b)=>{

const guide =
b.assignedGuide?.name ||
b.assignedGuide?.firstName;


if(guide){

acc[guide]=
(acc[guide]||0)+1;

}


return acc;

},{})
);



const vehicleAssignments =
{};


bookings.forEach(b=>{

const vehicle =
b.assignedVehicle?._id;


if(vehicle){

vehicleAssignments[vehicle]=
(vehicleAssignments[vehicle]||0)+1;

}

});



const vehicleConflicts =
Object.values(vehicleAssignments)
.filter(
count=>count>1
).length;



const upcomingDepartures =
bookings.filter(
b=>
new Date(b.travelDate) >= new Date()
).length;



const mostBookedTours =
Object.values(
bookings.reduce(
(acc,b)=>{

const name =
b.tour?.title ||
"Unknown";


acc[name]=
(acc[name]||0)+1;


return acc;

},{})
)
.sort((a,b)=>b-a)[0] || 0;


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





<div className="grid md:grid-cols-7 gap-4">


{
[
["Total Bookings",total],
["Pending Payments",
bookings.filter(b=>b.paymentStatus==="pending").length],
["Paid",paid],
["Cancelled",cancelled],
["Revenue",
`KES ${revenue.toLocaleString()}`],
["Upcoming Departures",upcoming],
["Most Booked",mostBookedTour]

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









<button

onClick={()=>exportBookingsCSV(bookings)}

className="bg-green-600 text-white px-4 py-2 rounded"

>

Export CSV

</button>



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





<div className="bg-white shadow rounded-xl p-5 space-y-4">


<h2 className="text-xl font-bold">
Operational View
</h2>



<div className="grid md:grid-cols-5 gap-4">


<div className="border rounded p-4">
<p>Today's Departures</p>
<h3 className="text-2xl font-bold">
{todayDepartures}
</h3>
</div>



<div className="border rounded p-4">
<p>Tomorrow</p>
<h3 className="text-2xl font-bold">
{tomorrowDepartures}
</h3>
</div>




<div className="border rounded p-4">
<p>Unassigned Paid</p>
<h3 className="text-2xl font-bold">
{unassignedPaidBookings}
</h3>
</div>




<div className="border rounded p-4">
<p>Vehicle Conflicts</p>
<h3 className="text-2xl font-bold">
{vehicleConflicts}
</h3>
</div>




<div className="border rounded p-4">
<p>Guide Load</p>
<h3 className="text-2xl font-bold">
{guideWorkload.length}
</h3>
</div>



</div>




</div>



<div className="bg-white shadow rounded-xl p-5">


<h2 className="font-bold text-lg mb-3">
Guide Workload Details
</h2>



<div className="grid md:grid-cols-3 gap-3">


{
guideWorkload.map(
([guide,count])=>(

<div
key={guide}
className="border rounded p-3"
>

<p>
{guide}
</p>

<strong>
{count} trips
</strong>


</div>


))
}


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

<button
className="border px-3 py-1 rounded"
onClick={()=>
setActionBooking(
actionBooking===b._id?null:b._id
)}
>
Actions
</button>


{
actionBooking===b._id &&

<div className="bg-white shadow rounded p-3 mt-2 space-y-2">


<button
onClick={()=>
statusMutation.mutate({
id:b._id,
status:"confirmed"
})
}
>
Confirm booking
</button>


<button
onClick={()=>
statusMutation.mutate({
id:b._id,
status:"cancelled"
})
}
>
Cancel booking
</button>


<button
onClick={()=>
statusMutation.mutate({
id:b._id,
status:"completed"
})
}
>
Mark completed
</button>


<button
onClick={()=>
refundMutation.mutate({

id:b._id,

payload:{
reason:
"Customer requested cancellation"
}

})
}
>
Refund booking
</button>


<button
onClick={()=>notificationMutation.mutate({

id:b._id,

payload:{
type:"confirmation",
channel:"sms"
}

})}
>
Send confirmation SMS
</button>


<button
onClick={()=>notificationMutation.mutate({

id:b._id,

payload:{
type:"payment_reminder",
channel:"whatsapp"
}

})}
>
Payment Reminder
</button>


<button
onClick={()=>notificationMutation.mutate({

id:b._id,

payload:{
type:"trip_reminder",
channel:"email"
}

})}
>
Trip Reminder
</button>


</div>

}

</td>

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

<button
className="px-3 py-1 bg-blue-600 text-white rounded"
onClick={()=>setSelectedBooking(b)}
>
View
</button>





<select
className="px-2 py-1 border rounded"
value={
b.assignedGuide?._id ||
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