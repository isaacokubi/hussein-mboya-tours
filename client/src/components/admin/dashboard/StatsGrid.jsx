import StatCard from "./Statcard";


export default function StatsGrid({stats}){


return (

<div className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-5
gap-6
">


<StatCard
title="Users"
value={stats.users}
/>


<StatCard
title="Tours"
value={stats.tours}
/>


<StatCard
title="Bookings"
value={stats.bookings}
/>


<StatCard
title="Revenue"
value={`Ksh ${Number(stats.revenue || 0)
.toLocaleString()}`}
/>


<StatCard
title="Agents"
value={stats.agents}
/>



</div>

);


}