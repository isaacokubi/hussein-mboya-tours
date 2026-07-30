import {

useEffect,

useState

}

from "react";


import {

BarChart,

Bar,

XAxis,

YAxis,

Tooltip,

ResponsiveContainer,

PieChart,

Pie,

Cell

}

from "recharts";


import {

getAnalytics

}

from "../../api/analyticsApi";




export default function AdminAnalytics(){


const [data,setData]=useState(null);




useEffect(()=>{


getAnalytics()

.then(res=>{


setData(

res.data.analytics

);


});


},[]);





if(!data)

return (

<div className="p-10">

Loading analytics...

</div>

);







return (

<div className="p-6">



<h1 className="
text-3xl
font-bold
mb-8
">

Business Analytics

</h1>







<div className="
grid
grid-cols-4
gap-5
mb-10
">



<Card

title="Revenue"

value={`KES ${data.revenue}`}

/>



<Card

title="Customers"

value={data.customers}

/>



<Card

title="Bookings"

value={data.bookings}

/>



<Card

title="Vehicles"

value={

data.vehicleStats.reduce(

(a,b)=>a+b.count,

0

)

}

/>



</div>









<h2 className="
text-xl
font-bold
mb-5
">

Monthly Revenue

</h2>



<div className="
bg-white
p-5
rounded-xl
shadow
">


<ResponsiveContainer

width="100%"

height={300}

>


<BarChart

data={data.monthlyRevenue}

>


<XAxis

dataKey="_id.month"

/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="revenue"

/>


</BarChart>


</ResponsiveContainer>


</div>









<h2 className="
text-xl
font-bold
mt-10
mb-5
">

Booking Status

</h2>




<div className="
bg-white
p-5
rounded-xl
shadow
">


<ResponsiveContainer

width="100%"

height={300}

>


<PieChart>


<Pie

data={data.bookingStatus}

dataKey="count"

nameKey="_id"

/>


</PieChart>


</ResponsiveContainer>



</div>




</div>


);

}







function Card({

title,

value

}){


return (

<div className="
bg-white
shadow
rounded-xl
p-5
">


<p className="
text-gray-500
">

{title}

</p>


<h2 className="
text-3xl
font-bold
">

{value}

</h2>



</div>


);

}