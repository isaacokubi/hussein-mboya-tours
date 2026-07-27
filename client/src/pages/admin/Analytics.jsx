import {

useQuery

}

from "@tanstack/react-query";


import {

getAnalytics

}

from "../../api/analyticsApi";


import RevenueChart
from "../../components/admin/RevenueChart";



export default function Analytics(){


const {

data,

isLoading

}

=
useQuery({

queryKey:[

"analytics"

],


queryFn:

getAnalytics


});



if(isLoading)

return <p>
Loading analytics...
</p>;



return (

<div>


<h1

className="
text-4xl
font-bold
"

>

Business Intelligence

</h1>



<div

className="
grid
md:grid-cols-3
gap-5
mt-8
"

>


<div

className="
bg-white
shadow
rounded-xl
p-6
"

>

Revenue

<h2>

KES {

data.revenue.totalRevenue

}

</h2>

</div>



<div

className="
bg-white
shadow
rounded-xl
p-6
"

>

Popular Tours

<h2>

{

data.popularTours.length

}

</h2>

</div>



<div

className="
bg-white
shadow
rounded-xl
p-6
"

>

Bookings

<h2>

{

data.bookings.length

}

</h2>

</div>


</div>



<RevenueChart

data={data.bookings}

/>


</div>

);

}