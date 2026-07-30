import {

Calendar,

Users,

Wallet,

TrendingUp

}

from "lucide-react";


import DashboardCard
from "../../components/agent/DashboardCard";


import useAgentDashboard
from "../../hooks/useAgentDashboard";




export default function AgentDashboard(){


const {
data,
isLoading
}
=
useAgentDashboard();



if(isLoading){

return (

<div>
Loading Agent Dashboard...
</div>

)

}



const stats =
data.data;



return (

<div>


<h1
className="
text-2xl
font-bold
mb-6
"
>

Dashboard

</h1>



<div
className="
grid
md:grid-cols-4
gap-6
"
>


<DashboardCard

title="Bookings"

value={stats.bookings}

icon={<Calendar/>}

/>


<DashboardCard

title="Completed Tours"

value={stats.completedTours}

icon={<TrendingUp/>}

/>


<DashboardCard

title="Revenue"

value={
`KES ${stats.revenue.toLocaleString()}`
}

icon={<Wallet/>}

/>


<DashboardCard

title="Commission"

value={
`KES ${stats.commission.toLocaleString()}`
}

icon={<Users/>}

/>


</div>


</div>

)

}