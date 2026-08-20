import { formatCurrency } from "../../utils/currency";

import {

Calendar,

Wallet,

TrendingUp,

BadgeDollarSign

}

from "lucide-react";



import DashboardCard
from "./DashboardCard";



import useAgentDashboard
from "../../hooks/useAgentDashboard";







export default function AgentDashboard(
){





const {

data,

isLoading,

isError

}

=

useAgentDashboard();








if(isLoading){


return (

<div
className="
p-6
text-gray-600
"
>

Loading Agent Dashboard...

</div>

);


}







if(isError){


return (

<div
className="
p-6
text-red-600
"
>

Failed to load dashboard data.

</div>

);


}








const stats = data || {};

















return (

<div>


<h1

className="
text-2xl
font-bold
mb-6
"

>

Agent Dashboard

</h1>







<div

className="
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-4
gap-6
"

>







<DashboardCard

title="Bookings"

value={stats.bookings || 0}

icon={<Calendar/>}

/>








<DashboardCard

title="Completed Tours"

value={stats.completedTours || 0}

icon={<TrendingUp/>}

/>








<DashboardCard

title="Revenue"

value={
formatCurrency(
stats.revenue
)
}

icon={<Wallet/>}

/>









<DashboardCard

title="Commission"

value={
formatCurrency(
stats.commission
)
}

icon={<BadgeDollarSign/>}

/>







</div>





</div>

);


}