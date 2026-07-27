import {
useQuery
}
from "@tanstack/react-query";


import {
getDashboard
}
from "../../api/adminApi";


import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip
}
from "recharts";



export default function AdminDashboard(){


const {
data
}
=
useQuery({

queryKey:[
"admin-dashboard"
],

queryFn:
getDashboard

});



if(!data)

return <div>
Loading...
</div>;



const chartData=[

{
name:"Revenue",
value:data.revenue
},

{
name:"Bookings",
value:data.bookings
}

];



return (

<div>


<h1
className="
text-4xl
font-bold
mb-8
"
>

Business Dashboard

</h1>



<div
className="
grid
md:grid-cols-5
gap-5
"
>


{

[

["Customers",data.users],

["Tours",data.tours],

["Bookings",data.bookings],

["Revenue",
`KES ${data.revenue}`],

["Pending",
data.pendingPayments]

].map(

(item)=>(


<div
className="
bg-white
shadow
rounded-xl
p-5
"
>

<h3>
{item[0]}
</h3>


<p
className="
text-3xl
font-bold
"
>

{item[1]}

</p>


</div>


)

)

}


</div>




<div
className="
mt-10
bg-white
p-6
rounded-xl
"
>


<BarChart

width={600}

height={300}

data={chartData}

>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="value"/>

</BarChart>


</div>


</div>

);

}