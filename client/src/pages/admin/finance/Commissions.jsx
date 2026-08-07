
import {
useQuery
} from "@tanstack/react-query";


import {
getCommissions
} from "../../../api/commissionApi";



export default function Commissions(){


const {
data=[],
isLoading
}=useQuery({

queryKey:["commissions"],

queryFn:getCommissions

});



if(isLoading)

return (

<div className="p-6">

Loading commissions...

</div>

);



return (

<div className="p-6">


<h1 className="text-2xl font-bold mb-5">

Agent Commissions

</h1>



<div className="bg-white rounded-xl shadow overflow-x-auto">


<table className="w-full">


<thead>

<tr className="border-b">


<th className="p-3 text-left">
Agent
</th>


<th className="p-3 text-left">
Booking
</th>


<th className="p-3 text-left">
Amount
</th>


<th className="p-3 text-left">
Rate
</th>


<th className="p-3 text-left">
Status
</th>


</tr>

</thead>



<tbody>


{
data.map(c=>(


<tr
key={c._id}
className="border-b"
>


<td className="p-3">

{
c.agent?.user?.name ||
"-"
}


<div className="text-sm text-gray-500">

{
c.agent?.user?.email
}

</div>


</td>



<td className="p-3">

{
c.booking?.bookingNumber ||
"-"
}

</td>



<td className="p-3">

KES {c.amount}

</td>



<td className="p-3">

{c.rate}%

</td>



<td className="p-3">

{c.status}

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
