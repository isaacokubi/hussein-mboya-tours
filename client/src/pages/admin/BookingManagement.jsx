import { requestRefund } from "../../api/financeApi";
import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import { exportBookingsCSV } from "../../utils/exportBookings";


import { getStaff } from "../../api/staffApi";
import { getVehicles } from "../../api/vehicleApi";


import {
  getBookings,
  updateBookingStatus,
  updateBookingPayment,
  assignBookingResources,
  sendBookingNotification
} from "../../api/adminBookingApi";




const BookingManagement = () => {



const queryClient = useQueryClient();



const [selectedBooking,setSelectedBooking] =
useState(null);

const [, setActionBooking] = useState(null);
const [search,setSearch] =
useState("");


const [statusFilter,setStatusFilter] =
useState("all");


const [paymentFilter,setPaymentFilter] =
useState("all");






/* ================= STAFF ================= */


const {
data:staffResponse
}=useQuery({

queryKey:["staff"],

queryFn:getStaff

});
const {
  data: vehicleResponse
} = useQuery({
  queryKey:["vehicles"],
  queryFn:getVehicles
});



const staff =
  Array.isArray(staffResponse) ? staffResponse :
  Array.isArray(staffResponse?.data) ? staffResponse.data :
  Array.isArray(staffResponse?.data?.data) ? staffResponse.data.data :
  [];

const guides = staff.filter((member) =>
  String(member.position || member.role || "").toLowerCase() === "guide" ||
  member.isGuide === true
);

const drivers = staff.filter((member) =>
  String(member.position || member.role || "").toLowerCase() === "driver"
);

const vehicles =
  Array.isArray(vehicleResponse) ? vehicleResponse :
  Array.isArray(vehicleResponse?.data) ? vehicleResponse.data :
  Array.isArray(vehicleResponse?.data?.data) ? vehicleResponse.data.data :
  Array.isArray(vehicleResponse?.vehicles) ? vehicleResponse.vehicles :
  [];





/* ================= BOOKINGS ================= */


const {
    data,
    isLoading,
    error
  } = useQuery({
  queryKey: [
    "admin-bookings",
    search,
    statusFilter,
    paymentFilter
  ],
  queryFn: () =>
    getBookings({
      search: search.trim(),
      status:
        statusFilter === "all"
          ? undefined
          : statusFilter,
      paymentStatus:
        paymentFilter === "all"
          ? undefined
          : paymentFilter,
      page: 1,
      limit: 100
    }),
  keepPreviousData: true,
});


const bookings =
Array.isArray(data)
?
data
:
Array.isArray(data?.data)
?
data.data
:
Array.isArray(data?.data?.bookings)
?
data.data.bookings
:
Array.isArray(data?.bookings)
?
data.bookings
:
[];







/* ================= STATUS ================= */


const statusMutation =
useMutation({

mutationFn:({id,status})=>
updateBookingStatus(
id,
status
),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

}

});







/* ================= PAYMENT ================= */


useMutation({

mutationFn:({id,status})=>

updateBookingPayment(

id,

{
status
}

),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

}

});







/* ================= REFUND ================= */


const refundMutation =
useMutation({

mutationFn:({id,payload})=>

requestRefund(
id,
payload
),


onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["admin-bookings"]

});

}

});








/* ================= NOTIFICATIONS ================= */


const notificationMutation =
useMutation({

mutationFn:({id,payload})=>

sendBookingNotification(
id,
payload
)

});








/* ================= ASSIGN RESOURCES ================= */


const assignMutation =
useMutation({

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





/* ================= DATE / OPERATIONS ================= */


const today = new Date();

today.setHours(
0,
0,
0,
0
);



const tomorrow = new Date(today);

tomorrow.setDate(
tomorrow.getDate()+1
);




const todaysDepartures =

bookings.filter(
b=>{

const date =
new Date(b.travelDate);

date.setHours(
0,
0,
0,
0
);


return date.getTime() === today.getTime();

}

).length;




const tomorrowDepartures =

bookings.filter(
b=>{

const date =
new Date(b.travelDate);

date.setHours(
0,
0,
0,
0
);


return date.getTime() === tomorrow.getTime();

}

).length;








/* ================= GUIDE WORKLOAD ================= */


const guideWorkload = {};



bookings.forEach(b=>{


const guide =

b.assignedGuide?.name ||
b.assignedGuide?.firstName;



if(guide){

guideWorkload[guide] =

(guideWorkload[guide] || 0) + 1;

}


});








/* ================= FILTERING ================= */


const filteredBookings =

bookings.filter((b)=>{
const tour =

b.tour?.title ||
b.tour?.name ||
"";




const payment =

typeof b.paymentStatus === "string"

?

b.paymentStatus

:

b.paymentStatus?.status || "";





const normalizedSearch =
  search.trim().toLowerCase();

const bookingId =
  String(b._id || "").toLowerCase();

const bookingNumber =
  String(b.bookingNumber || "").toLowerCase();

const _customerName =
  String(
    b._customer?.name ||
    b._customerSnapshot?.name ||
    b.user?.name ||
    b.user?.firstName ||
    ""
  ).toLowerCase();

const _customerEmail =
  String(
    b._customer?.email ||
    b._customerSnapshot?.email ||
    b.user?.email ||
    ""
  ).toLowerCase();

const _customerPhone =
  String(
    b._customer?.phone ||
    b._customerSnapshot?.phone ||
    b.user?.phone ||
    ""
  ).toLowerCase();


const matchesSearch =
  !normalizedSearch ||
  bookingId.includes(normalizedSearch) ||
  bookingNumber.includes(normalizedSearch) ||
  _customerName.includes(normalizedSearch) ||
  _customerEmail.includes(normalizedSearch) ||
  _customerPhone.includes(normalizedSearch) ||
  tour.includes(normalizedSearch);

const matchesStatus =

statusFilter==="all"

||

b.status===statusFilter;






const matchesPayment =

paymentFilter==="all"

||

payment===paymentFilter;






return (

matchesSearch &&

matchesStatus &&

matchesPayment

);


});









/* ================= STATISTICS ================= */



const total =

bookings.length;





const cancelled =

bookings.filter(

b=>

b.status==="cancelled"

).length;





const revenue = bookings.reduce((sum, booking) => {
  const status = String(
    typeof booking.paymentStatus === "string"
      ? booking.paymentStatus
      : booking.paymentStatus?.status || "pending"
  ).toLowerCase();

  if (!["paid", "completed"].includes(status)) return sum;

  const paidAmount =
    Number(booking.depositAmount || 0) ||
    Number(booking.totalAmount || booking.amount || 0);

  return sum + Math.max(
    0,
    paidAmount - Number(booking.refundAmount || 0)
  );
}, 0);



/* ================= MOST BOOKED TOUR ================= */



const tourCounts = {};



bookings.forEach(b=>{


const name =

b.tour?.title ||

b.tour?.name;



if(name){

tourCounts[name] =

(tourCounts[name] || 0) + 1;

}


});





const mostBookedTour =
Object.entries(tourCounts).sort(
  (a, b) => b[1] - a[1]
)[0]?.[0] || "None";

const paid =
bookings.filter((booking) => {
  const paymentStatus = String(
    typeof booking.paymentStatus === "string"
      ? booking.paymentStatus
      : booking.paymentStatus?.status || "pending"
  ).toLowerCase();

  return paymentStatus === "paid";
}).length;

const upcoming =
bookings.filter((booking) => {
  const travelDate = new Date(booking.travelDate);
  return (
    !Number.isNaN(travelDate.getTime()) &&
    travelDate >= new Date() &&
    !["cancelled", "refunded", "completed"].includes(
      String(booking.status || "").toLowerCase()
    )
  );
}).length;









/* ================= RESOURCE CHECKS ================= */



const unassignedPaidBookings =

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

&&

!b.assignedGuide

&&

!b.assignedVehicle

).length;







const vehicleAssignments = {};



bookings.forEach(b=>{


const vehicle =

b.assignedVehicle?._id;



if(vehicle){

vehicleAssignments[vehicle] =

(vehicleAssignments[vehicle] || 0) + 1;

}


});







const vehicleConflicts =

Object.values(vehicleAssignments)

.filter(

count=>count>1

)

.length;
/* ================= PAGE UI ================= */


return (

<div className="p-6 space-y-6">



<h1 className="text-3xl font-bold">

Booking Management

</h1>





{/* SUMMARY CARDS */}


<div className="grid md:grid-cols-7 gap-4">


{
[
[
"Total Bookings",
total
],

[
"Pending Payments",
bookings.filter(
b=>
(
typeof b.paymentStatus==="string"
?
b.paymentStatus
:
b.paymentStatus?.status
)
==="pending"
).length
],

[
"Paid",
paid
],

[
"Cancelled",
cancelled
],

[
"Revenue",
`KES ${revenue.toLocaleString()}`
],

[
"Upcoming Departures",
upcoming
],

[
"Most Booked",
mostBookedTour
]

]

.map(([title,value])=>(


<div

key={title}

className="bg-white shadow rounded-xl p-5"

>


<p className="text-gray-600">

{title}

</p>


<h2 className="text-3xl font-bold">

{value}

</h2>


</div>


))

}


</div>








{/* EXPORT */}



<button

onClick={()=>exportBookingsCSV(bookings)}

className="bg-green-600 text-white px-4 py-2 rounded"

>

Export CSV

</button>









{/* FILTERS */}



<div className="grid md:grid-cols-3 gap-4">


<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Search _ tour or booking ID"

className="border rounded px-3 py-2"

/>





<select

value={statusFilter}

onChange={(e)=>
setStatusFilter(e.target.value)
}

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







<select

value={paymentFilter}

onChange={(e)=>
setPaymentFilter(e.target.value)
}

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









{/* OPERATIONAL VIEW */}



<div className="bg-white shadow rounded-xl p-5">


<h2 className="text-xl font-bold mb-4">

Operational View

</h2>





<div className="grid md:grid-cols-5 gap-4">





<div className="border rounded p-4">

<p>
Today's Departures
</p>

<h3 className="text-2xl font-bold">

{todaysDepartures}

</h3>

</div>






<div className="border rounded p-4">

<p>
Tomorrow
</p>

<h3 className="text-2xl font-bold">

{tomorrowDepartures}

</h3>

</div>







<div className="border rounded p-4">

<p>
Unassigned Paid
</p>

<h3 className="text-2xl font-bold">

{unassignedPaidBookings}

</h3>

</div>








<div className="border rounded p-4">

<p>
Vehicle Conflicts
</p>

<h3 className="text-2xl font-bold">

{vehicleConflicts}

</h3>

</div>








<div className="border rounded p-4">

<p>
Guide Load
</p>

<h3 className="text-2xl font-bold">

{
Object.keys(guideWorkload).length
}

</h3>

</div>





</div>


</div>









{/* GUIDE WORKLOAD */}



<div className="bg-white shadow rounded-xl p-5">


<h2 className="text-xl font-bold mb-4">

Guide Workload Details

</h2>





<div className="grid md:grid-cols-3 gap-3">



{

Object.entries(guideWorkload)

.map(

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


)


)


}



</div>


</div>






{/* TABLE STARTS PART 4 */}


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

(Array.isArray(filteredBookings) ? filteredBookings : [])

.map((b)=>(


<tr

key={b._id}

className="border-b"

>





<td className="p-3">

#{b._id?.slice(-6)}

</td>







<td className="p-3">


{

b._customer?.name ||

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








{/* WORKFLOW */}
<td className="p-3">
  <select
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
    value=""
    onChange={(e) => {
      const action = e.target.value;
      if (!action) return;
      if (["confirmed","assigned","ongoing","completed","cancelled"].includes(action)) {
        statusMutation.mutate({ id: b._id, status: action });
      } else if (action === "refund") {
        refundMutation.mutate({ id: b._id, payload: { reason: "Admin refund request" } });
      } else if (action === "sms") {
        notificationMutation.mutate({ id: b._id, payload: { type: "confirmation", channel: "sms" } });
      } else if (action === "payment-reminder") {
        notificationMutation.mutate({ id: b._id, payload: { type: "payment_reminder", channel: "whatsapp" } });
      } else if (action === "trip-reminder") {
        notificationMutation.mutate({ id: b._id, payload: { type: "trip_reminder", channel: "email" } });
      }
      setActionBooking(null);
    }}
  >
    <option value="">Choose action...</option>
    <option value="confirmed">Confirm booking</option>
    <option value="assigned">Mark assigned</option>
    <option value="ongoing">Start / ongoing</option>
    <option value="completed">Mark completed</option>
    <option value="cancelled">Cancel booking</option>
    <option value="refund">Request refund</option>
    <option value="sms">Send confirmation SMS</option>
    <option value="payment-reminder">Payment reminder</option>
    <option value="trip-reminder">Trip reminder</option>
  </select>
</td>

{/* ACTIONS / ASSIGNMENT */}



<td className="p-3 space-x-2">





<button

className="px-3 py-1 bg-blue-600 text-white rounded"

onClick={()=>setSelectedBooking(b)}

>

View

</button>








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










<select

className="px-2 py-1 border rounded"

value={b.assignedGuide?._id || ""}

onChange={(e)=>{


if(e.target.value){


assignMutation.mutate({

id:b._id,


payload:{

guide:e.target.value,

driver:b.assignedDriver?._id || null,

vehicle:b.assignedVehicle?._id || null

}

});


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


{

g.firstName || g.lastName

?

`${g.firstName || ""} ${g.lastName || ""}`

:

g.name || "Guide"

}


</option>


))


}



</select>









<select

className="px-2 py-1 border rounded"

value={b.assignedDriver?._id || ""}


onChange={(e)=>{


if(e.target.value){


assignMutation.mutate({

id:b._id,


payload:{

guide:b.assignedGuide?._id || null,

driver:e.target.value,

vehicle:b.assignedVehicle?._id || null

}


});


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


});


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


{

v.name ||

v.registrationNumber ||

"Vehicle"

}


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



<div className="bg-white w-full md:w-96 h-full p-6 shadow-xl overflow-y-auto">



<h2 className="text-2xl font-bold mb-4">

Booking Details

</h2>






<p>

<strong>ID:</strong>

{" "}

{selectedBooking._id}

</p>







<p className="mt-2">

<strong>Customer:</strong>

{" "}

{

selectedBooking._customer?.name ||

selectedBooking.user?.name ||

selectedBooking.user?.firstName ||

"Unknown"

}


</p>







<p className="mt-2">

<strong>Tour:</strong>

{" "}

{

selectedBooking.tour?.title ||

selectedBooking.tour?.name ||

"Unknown"

}


</p>








<p className="mt-2">

<strong>Amount:</strong>

{" "}

KES {

selectedBooking.amount ||

selectedBooking.totalAmount ||

0

}


</p>








<p className="mt-2">

<strong>Payment:</strong>

{" "}

{

typeof selectedBooking.paymentStatus==="string"

?

selectedBooking.paymentStatus

:

selectedBooking.paymentStatus?.status ||

"pending"

}


</p>








<p className="mt-2">

<strong>Status:</strong>

{" "}

{

selectedBooking.status ||

"pending"

}


</p>








<p className="mt-2">

<strong>Payment Method:</strong>

{" "}

{

selectedBooking.paymentMethod ||

"MPESA"

}


</p>








<p className="mt-2">

<strong>M-Pesa Receipt:</strong>

{" "}

{

selectedBooking.mpesaReceiptNumber ||

selectedBooking.payment?.mpesaReceiptNumber ||

"Pending"

}


</p>








<p className="mt-2">

<strong>Phone:</strong>

{" "}

{

selectedBooking.phone ||

selectedBooking._customer?.phone ||

selectedBooking.user?.phone ||

"Not available"

}


</p>








<p className="mt-2">

<strong>Payment Date:</strong>

{" "}

{

selectedBooking.paymentDate ||

selectedBooking.updatedAt ||

"Pending"

}


</p>









<button


onClick={()=>setSelectedBooking(null)}


className="mt-6 px-4 py-2 bg-gray-800 text-white rounded"


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
