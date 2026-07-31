import {

LineChart,

Line,

XAxis,

YAxis,

Tooltip,

ResponsiveContainer,

CartesianGrid

}

from "recharts";






export default function RevenueChart({

data = []

}){





const formatCurrency = (value)=>{


return new Intl.NumberFormat(

"en-KE",

{

style:"currency",

currency:"KES"

}

).format(value);


};







const formatDate = (date)=>{


return new Date(date)

.toLocaleDateString(

"en-KE",

{

day:"2-digit",

month:"short"

}

);


};








return (

<div
className="
bg-white
rounded-xl
shadow
p-5
"
>


<h3
className="
text-lg
font-bold
mb-4
text-gray-800
"
>

Revenue Overview

</h3>






<ResponsiveContainer

width="100%"

height={300}

>


<LineChart

data={data}

margin={{

top:10,

right:20,

left:10,

bottom:10

}}

>



<CartesianGrid

strokeDasharray="3 3"

/>






<XAxis

dataKey="_id"

tickFormatter={formatDate}

/>







<YAxis

tickFormatter={(value)=>

`KES ${value}`

}

/>







<Tooltip

formatter={

(value)=>

[

formatCurrency(value),

"Revenue"

]

}

/>







<Line

type="monotone"

dataKey="revenue"

strokeWidth={3}

dot={true}

/>






</LineChart>



</ResponsiveContainer>




</div>

);


}