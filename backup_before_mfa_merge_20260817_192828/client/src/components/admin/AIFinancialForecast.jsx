export default function AIFinancialForecast({
data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Financial Forecasting
</h2>


<div className="grid md:grid-cols-3 gap-4 mb-6">


<div className="border rounded p-4">

Expected Revenue

<br/>

<b>
KES {data.forecast?.nextMonthRevenue || 0}
</b>

</div>



<div className="border rounded p-4">

Expected Bookings

<br/>

<b>
{data.forecast?.nextMonthBookings || 0}
</b>

</div>



<div className="border rounded p-4">

Growth Outlook

<br/>

<b>
{data.forecast?.growthPotential || "N/A"}
</b>

</div>


</div>



<h3 className="font-bold mb-3">
AI Recommendations
</h3>


<ul className="list-disc ml-6">

{
(data.recommendations || [])
.map(
(item,index)=>(

<li key={index}>
{item}
</li>

))
}

</ul>


</div>

);

}
