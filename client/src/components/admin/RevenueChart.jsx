import {

LineChart,

Line,

XAxis,

YAxis,

Tooltip,

ResponsiveContainer

}

from "recharts";



export default function RevenueChart({
data
}){


return (

<ResponsiveContainer

width="100%"

height={300}

>


<LineChart

data={data}

>


<XAxis

dataKey="_id"

/>


<YAxis/>


<Tooltip/>


<Line

type="monotone"

dataKey="bookings"

/>


</LineChart>


</ResponsiveContainer>


);

}