import React from "react";

import {

LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer

} from "recharts";



const data=[

{
month:"Jan",
revenue:120000
},

{
month:"Feb",
revenue:180000
},

{
month:"Mar",
revenue:250000
},

{
month:"Apr",
revenue:450000
},

{
month:"May",
revenue:520000
}


];



const RevenueChart=()=>{


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
font-bold
text-xl
mb-5
">
Revenue Growth
</h2>



<ResponsiveContainer
width="100%"
height={300}
>


<LineChart
data={data}
>


<XAxis dataKey="month"/>

<YAxis/>


<Tooltip/>


<Line
type="monotone"
dataKey="revenue"
/>


</LineChart>


</ResponsiveContainer>



</div>


)

}


export default RevenueChart;