


import {
useQuery
}
from "@tanstack/react-query";


import {
getFinanceStats

}
from "../../api/financeApi";



export default function Finance(){


const {
data

}=useQuery({

queryKey:["finance"],

queryFn:getFinanceStats

});



return (

<div className="p-6">


<h1 className="text-3xl font-bold">
Finance Dashboard
</h1>


<div className="grid md:grid-cols-4 gap-5 mt-5">


<div className="bg-white shadow rounded p-5">
Revenue
<h2>
KES {stats.revenue || stats.totalRevenue || 0}
</h2>
</div>


<div className="bg-white shadow rounded p-5">
Paid Revenue
<h2>
KES {stats.netRevenue || stats.paidRevenue || 0}
</h2>
</div>


<div className="bg-white shadow rounded p-5">
Pending Payments
<h2>
{stats.pendingPayments || 0}
</h2>
</div>


<div className="bg-white shadow rounded p-5">
Bookings
<h2>
{stats.paidBookings || stats.bookings || 0}
</h2>
</div>


</div>


</div>

)

}

