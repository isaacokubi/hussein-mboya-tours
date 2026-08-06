import { useQuery } from "@tanstack/react-query";

import {
  getAdminPayments,
  getPaymentStats,
} from "../../../api/admin/adminPaymentApi";


export default function AdminPayments(){

  const {
    data: payments,
    isLoading
  } = useQuery({

    queryKey:["adminPayments"],

    queryFn:getAdminPayments

  });


  
console.log("PAYMENTS RESPONSE:", payments);
console.log("STATS RESPONSE:", stats);

const {
    data: stats
  } = useQuery({

    queryKey:["paymentStats"],

    queryFn:getPaymentStats

  });



  if(isLoading){

    return (
      <div className="p-6">
        Loading payments...
      </div>
    );

  }


return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Payment Management
</h1>



<div className="grid md:grid-cols-3 gap-5">


<div className="bg-white shadow rounded-xl p-5">

<h3>
Completed
</h3>

<p className="text-3xl font-bold">

{stats?.stats?.find(
 s=>s._id==="completed"
)?.count || 0}

</p>

</div>



<div className="bg-white shadow rounded-xl p-5">

<h3>
Pending
</h3>

<p className="text-3xl font-bold">

{stats?.stats?.find(
 s=>s._id==="pending"
)?.count || 0}

</p>

</div>



<div className="bg-white shadow rounded-xl p-5">

<h3>
Failed
</h3>

<p className="text-3xl font-bold">

{stats?.stats?.find(
 s=>s._id==="failed"
)?.count || 0}

</p>

</div>


</div>




<div className="bg-white rounded-xl shadow p-5">

<table className="w-full">

<thead>

<tr>

<th>ID</th>
<th>Status</th>
<th>Amount</th>

</tr>

</thead>


<tbody>

{
payments?.payments?.map((payment)=>(

<tr key={payment._id}>

<td>
{payment._id}
</td>

<td>
{payment.status}
</td>

<td>
{payment.amount}
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
