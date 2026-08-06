
import {
useQuery
}
from "@tanstack/react-query";

import {
getPaymentReconciliation
}
from "../../../api/admin/adminPaymentApi";


export default function Reconciliation(){


const {
data,
isLoading
}=useQuery({

queryKey:[
"payment-reconciliation"
],

queryFn:
getPaymentReconciliation

});



if(isLoading)
return <div>
Loading...
</div>



const dataSet =
data?.data || {};



const summary =
dataSet.summary || {};



return (

<div className="p-6">


<h1 className="text-2xl font-bold mb-6">
Payment Reconciliation
</h1>


<div className="
grid
md:grid-cols-5
gap-4
">


{
Object.entries(summary)
.map(
([key,value])=>(

<div
key={key}
className="
border
rounded
p-4
"
>

<h3 className="font-bold">
{key}
</h3>

<p>
{value}
</p>

</div>

))
}


</div>



<h2 className="
text-xl
font-bold
mt-8
">

Mismatched Payments

</h2>



{
dataSet.mismatches?.map(
p=>(

<div
key={p._id}
className="
border
p-3
mt-2
"
>

{p.booking?.bookingNumber}

-
{p.status}

</div>

))
}



</div>

)


}

