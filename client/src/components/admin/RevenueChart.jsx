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
data=[]
}){



return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
font-bold
mb-4
">

Revenue Analytics

</h2>



<ResponsiveContainer
width="100%"
height={300}
>


<LineChart data={data}>


<XAxis
dataKey="_id.month"
/>


<YAxis/>


<Tooltip/>


<Line

type="monotone"

dataKey="amount"

/>


</LineChart>


</ResponsiveContainer>



</div>


)


}
