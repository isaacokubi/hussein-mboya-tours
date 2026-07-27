import React,{
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

ResponsiveContainer

}

from "recharts";



import {

toast

}

from "react-toastify";


import {

getTourReports

}

from "../../api/tourApi";







const TourReports =()=>{


const [

reports,

setReports

]=useState(null);






useEffect(()=>{


const load=async()=>{


try{


const response =
await getTourReports();


setReports(

response.data.reports

);


}

catch(error){


toast.error(
"Failed loading reports"
);


}



};



load();



},[]);









if(!reports){


return (

<div className="p-10">

Loading reports...

</div>

);


}







return (

<div
className="
min-h-screen
bg-gray-100
p-6
"
>



<h1
className="
text-3xl
font-bold
mb-8
"
>

Tour Analytics

</h1>







<div
className="
grid
md:grid-cols-5
gap-5
mb-8
"
>



{

[

["Bookings",
reports.totalBookings],

["Revenue",
reports.totalRevenue],

["Customers",
reports.totalCustomers],

["Tours",
reports.totalTours],

["Completed",
reports.completedTours]


]

.map(

(item,index)=>(


<div

key={index}

className="
bg-white
shadow
rounded-xl
p-5
"

>


<p
className="
text-gray-500
"
>

{item[0]}

</p>


<h2
className="
text-3xl
font-bold
mt-2
"
>

{item[1]}

</h2>


</div>


)

)

}



</div>









<div
className="
bg-white
rounded-xl
shadow
p-6
"
>


<h2
className="
text-xl
font-bold
mb-5
"
>

Revenue Performance

</h2>





<ResponsiveContainer

width="100%"

height={350}

>


<BarChart

data={
reports.monthlyRevenue
}


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





</div>


);


};


export default TourReports;