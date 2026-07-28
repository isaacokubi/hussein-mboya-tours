import {
useEffect,
useState
}
from "react";


import {
getMpesaTransactions
}
from "../../../api/financeApi";



export default function MpesaTransactions(){


const [payments,setPayments]=useState([]);

const [search,setSearch]=useState("");

const [status,setStatus]=useState("");





const loadTransactions = async()=>{


const res =
await getMpesaTransactions({

search,

status

});



setPayments(

res.data.payments

);


};





useEffect(()=>{


loadTransactions();


},[status]);







return (

<div className="p-6">


<h1
className="
text-3xl
font-bold
mb-8
"
>

M-Pesa Transactions

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
Search receipt or customer
"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>



<button

onClick={loadTransactions}

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
e=>setStatus(e.target.value)
}

>


<option value="">
All Payments
</option>


<option value="completed">
Completed
</option>


<option value="pending">
Pending
</option>


<option value="failed">
Failed
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


<th className="p-4 text-left">
Receipt
</th>


<th className="p-4 text-left">
Customer
</th>


<th className="p-4 text-left">
Booking
</th>


<th className="p-4 text-left">
Amount
</th>


<th className="p-4 text-left">
Method
</th>


<th className="p-4 text-left">
Status
</th>


<th className="p-4 text-left">
Date
</th>


</tr>


</thead>






<tbody>


{

payments.map(payment=>(


<tr

key={payment._id}

className="
border-b
"

>


<td className="p-4">

{payment.transactionId || "N/A"}

</td>




<td className="p-4">

<div>

{
payment.customer?.name
}

</div>

<small>

{
payment.customer?.phone
}

</small>

</td>





<td className="p-4">

{
payment.booking?.bookingNumber
||
"N/A"
}

</td>





<td className="p-4">

KES {payment.amount}

</td>





<td className="p-4">

{
payment.paymentMethod
}

</td>





<td className="p-4">


<span
className="
px-3
py-1
rounded-full
bg-green-100
"
>

{
payment.status
}

</span>


</td>





<td className="p-4">

{
new Date(
payment.createdAt
)
.toLocaleDateString()

}

</td>





</tr>


))

}


</tbody>


</table>


</div>




</div>

);


}