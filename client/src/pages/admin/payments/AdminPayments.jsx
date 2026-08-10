
import {
  useState
} from "react";

import { toast } from "react-toastify";


import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import {
  getAdminPayments,
  getPaymentStats,
  updatePaymentStatus,
  refundPayment,
  exportPaymentsCSV,
  exportPaymentsPDF
} from "../../../api/admin/adminPaymentApi";



export default function AdminPayments(){


const queryClient = useQueryClient();



const [search,setSearch] = useState("");

const [statusFilter,setStatusFilter] = useState("all");
const [selectedPayment,setSelectedPayment] = useState(null);




const {
data:paymentsResponse,
isLoading,
error
}=useQuery({

queryKey:[
"adminPayments"
],

queryFn:getAdminPayments

});




const {
data:statsResponse
}=useQuery({

queryKey:[
"paymentStats"
],

queryFn:getPaymentStats

});




const payments =
  Array.isArray(paymentsResponse?.payments) ? paymentsResponse.payments :
  Array.isArray(paymentsResponse?.data?.payments) ? paymentsResponse.data.payments :
  Array.isArray(paymentsResponse?.data) ? paymentsResponse.data :
  Array.isArray(paymentsResponse) ? paymentsResponse : [];




const stats =

statsResponse?.stats ||

[];







const refundMutation =
useMutation({

mutationFn:
(id)=>
refundPayment(id),


onSuccess:()=>{
  queryClient.invalidateQueries({ queryKey:["adminPayments"] });
  toast.success("Refund request submitted.");
},
onError:(error)=>{
  toast.error(error?.response?.data?.message || "Refund failed.");
}

});


const statusMutation = useMutation({

mutationFn:({id,status})=>

updatePaymentStatus(
id,
{
status
}
),


onSuccess:()=>{
  queryClient.invalidateQueries({ queryKey:["adminPayments"] });
  queryClient.invalidateQueries({ queryKey:["paymentStats"] });
  toast.success("Payment status updated.");
},
onError:(error)=>{
  toast.error(error?.response?.data?.message || "Unable to update payment status.");
}

});







if(isLoading)

return (

<div className="p-6">

Loading payments...

</div>

);





if(error)

return (

<div className="p-6 text-red-600">

Failed loading payments

</div>

);







const filteredPayments = payments.filter(payment=>{


const customer =

payment.customer?.name ||

"";


const receipt =

payment.mpesaReceiptNumber ||

"";


const matchesSearch =

(customer + receipt)

.toLowerCase()

.includes(
search.toLowerCase()
);



const matchesStatus =

statusFilter==="all"

?

true

:


(
payment.status ||
payment.paymentStatus
)===statusFilter
;



return matchesSearch && matchesStatus;


});







const revenue =

stats
.filter(
s=>
(
s._id==="completed" ||
s._id==="paid"
)

)
.reduce(
(sum,s)=>sum+s.amount,
0
);








return (

<div className="p-6 space-y-8">



<h1 className="
text-3xl
font-bold
">

Payment Management

</h1>






<div className="
grid
md:grid-cols-4
gap-5
">


<Card
title="Total Payments"
value={payments.length}
/>


<Card
title="Completed Revenue"
value={`KES ${revenue.toLocaleString()}`}
/>


<Card
title="Pending"
value={
stats.find(
s=>s._id==="pending"
)?.count || 0
}
/>


<Card
title="Failed"
value={
stats.find(
s=>s._id==="failed"
)?.count || 0
}
/>


</div>






<div className="
flex
gap-4
">


<input

className="
border
rounded
p-3
w-80
"

placeholder="Search customer or receipt"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>



<select

className="
border
rounded
p-3
"

value={statusFilter}

onChange={
e=>setStatusFilter(e.target.value)
}

>

<option value="all">
All
</option>

<option value="pending">
Pending
</option>

<option value="processing">
Processing
</option>

<option value="completed">
Completed
</option>

<option value="failed">
Failed
</option>

<option value="cancelled">
Cancelled
</option>

<option value="refunded">
Refunded
</option>


</select>


</div>







<div className="
bg-white
shadow
rounded-xl
overflow-x-auto
">



<div className="flex gap-3 mb-4">

<button
className="px-4 py-2 bg-green-600 text-white rounded"
onClick={exportPaymentsCSV}
>
Export CSV
</button>

<button
className="px-4 py-2 bg-red-600 text-white rounded"
onClick={exportPaymentsPDF}
>
Export PDF
</button>

</div>

<table className="w-full">


<thead>

<tr className="border-b">


<th className="p-3 text-left">
Customer
</th>


<th className="p-3 text-left">
Booking
</th>


<th className="p-3 text-left">
Amount
</th>


<th className="p-3 text-left">
Receipt
</th>


<th className="p-3 text-left">
Phone
</th>


<th className="p-3 text-left">
Status
</th>



<th className="p-3">Actions</th>
</tr>


</thead>




<tbody>


{
filteredPayments.length ?


filteredPayments.map(payment=>(


<tr
key={payment._id}
className="border-b"
>



<td className="p-3">

{
payment.customer?.name ||
"Guest"
}

</td>



<td className="p-3">

{
payment.booking?.bookingNumber ||
"-"
}

</td>



<td className="p-3 font-bold">

KES {payment.amount}

</td>




<td className="p-3">

{
payment.mpesaReceiptNumber ||
"-"
}

</td>



<td className="p-3">

{
payment.phoneNumber ||
payment.phone ||
"-"
}

</td>




<td className="p-3">


<select

className="
border
rounded
p-2
"

value={payment.status || payment.paymentStatus}

onChange={
e=>

statusMutation.mutate({

id:payment._id,

status:e.target.value

})

}

>


<option value="pending">
Pending
</option>

<option value="processing">
Processing
</option>

<option value="completed">
Completed
</option>

<option value="failed">
Failed
</option>

<option value="cancelled">
Cancelled
</option>

<option value="refunded">
Refunded
</option>



</select>



</td>


<td className="p-3 flex gap-2">

<button
  type="button"
  onClick={() => setSelectedPayment(payment)}
  className="px-3 py-1 bg-blue-600 text-white rounded"
>
View
</button>


<button
  type="button"
  disabled={refundMutation.isPending}
  onClick={() => refundMutation.mutate(payment._id)}
  className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
>
  {refundMutation.isPending ? "Refunding..." : "Refund"}
</button>

</td>


</tr>



))


:

<tr>

<td
colSpan="6"
className="p-6 text-center"
>

No payments found

</td>

</tr>


}



</tbody>


</table>

{selectedPayment && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        <button type="button" onClick={() => setSelectedPayment(null)} className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100">Close</button>
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <p><strong>Customer:</strong> {selectedPayment.customer?.name || "Guest"}</p>
        <p><strong>Booking:</strong> {selectedPayment.booking?.bookingNumber || "-"}</p>
        <p><strong>Amount:</strong> KES {Number(selectedPayment.amount || 0).toLocaleString()}</p>
        <p><strong>Phone:</strong> {selectedPayment.phoneNumber || selectedPayment.phone || "-"}</p>
        <p><strong>Receipt:</strong> {selectedPayment.mpesaReceiptNumber || selectedPayment.mpesaReceipt || "-"}</p>
        <p><strong>Status:</strong> {selectedPayment.status || selectedPayment.paymentStatus || "-"}</p>
      </div>
    </div>
  </div>
)}

</div>


</div>

);

}



function Card({title,value}){


return (

<div className="
bg-white
shadow
rounded-xl
p-5
">


<h3>

{title}

</h3>


<p className="
text-3xl
font-bold
">

{value}

</p>


</div>

);



}