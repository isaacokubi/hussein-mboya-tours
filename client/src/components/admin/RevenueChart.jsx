/**
 * Purpose: Revenue Chart reusable UI component. Main declarations: RevenueChart.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
}
from "recharts";





// Define RevenueChart; its parameters and body implement this operation.
export default function RevenueChart({
data=[]
}){



// Return the expression shown below to the caller.
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
