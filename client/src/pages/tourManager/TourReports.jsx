import {
    useEffect,
    useState
} from "react";


import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";


import {
    toast
} from "react-toastify";


import {
    getTourReports
} from "../../api/tourApi";







export default function TourReports(
){


const [reports,setReports] = useState(null);


const [loading,setLoading] = useState(true);








useEffect(()=>{


const loadReports = async()=>{


try{


const response =
await getTourReports();



setReports(
response?.data ||
{}
);



}

catch(error){


console.error(error);


toast.error(
"Failed loading reports"
);


}

finally{


setLoading(false);


}


};



loadReports();



},[]);









if(loading){


return (

<div className="
p-10
text-gray-600
">

Loading reports...

</div>

);


}







if(!reports){


return (

<div className="
p-10
text-red-600
">

No reports available.

</div>

);


}








const cards=[


{
title:"Total Bookings",
value:reports.totalBookings || 0
},


{
title:"Revenue",
value:`KES ${reports.totalRevenue || 0}`
},


{
title:"Customers",
value:reports.totalCustomers || 0
},


{
title:"Tours",
value:reports.totalTours || 0
},


{
title:"Completed",
value:reports.completedTours || 0
}


];








const chartData =

reports.monthlyRevenue?.map(item=>({


month:

`${item._id.month}/${item._id.year}`,


revenue:

item.revenue || 0



})) || [];









return (

<div className="
min-h-screen
bg-gray-100
p-6
">







<h1 className="
text-3xl
font-bold
mb-8
">

Tour Analytics

</h1>










{/* KPI CARDS */}



<div className="
grid
sm:grid-cols-2
lg:grid-cols-5
gap-5
mb-8
">


{

cards.map((card,index)=>(


<div

key={index}

className="
bg-white
shadow
rounded-xl
p-5
"

>


<p className="
text-gray-500
text-sm
">

{card.title}

</p>



<h2 className="
text-3xl
font-bold
mt-2
">

{card.value}

</h2>



</div>


))


}



</div>









{/* REVENUE CHART */}



<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
text-xl
font-bold
mb-6
">

Revenue Performance

</h2>





{

chartData.length === 0

?


<p className="
text-gray-500
">

No revenue data available.

</p>



:


<ResponsiveContainer

width="100%"

height={350}

>


<BarChart

data={chartData}

>


<XAxis

dataKey="month"

/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="revenue"

/>


</BarChart>



</ResponsiveContainer>


}



</div>






</div>

);


}