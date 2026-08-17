export default function AISalesAssistant({
data={}
}){

return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-2xl font-bold mb-5">
AI Sales Assistant
</h2>


<div className="grid md:grid-cols-4 gap-3">


<div className="border rounded p-3">
Bookings
<br/>
<b>
{data.metrics?.totalBookings || 0}
</b>
</div>


<div className="border rounded p-3">
Confirmed
<br/>
<b>
{data.metrics?.confirmedBookings || 0}
</b>
</div>


<div className="border rounded p-3">
Customers
<br/>
<b>
{data.metrics?.customers || 0}
</b>
</div>


<div className="border rounded p-3">
Conversion
<br/>
<b>
{data.metrics?.conversionRate || 0}%
</b>
</div>


</div>



<h3 className="font-bold mt-6">
Sales Recommendations
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



<h3 className="font-bold mt-6">
AI Generated Sales Messages
</h3>


<div className="space-y-3">

{
(data.salesScripts || [])
.map(
(item,index)=>(

<div
key={index}
className="border rounded p-4"
>

<b>
{item.title}
</b>

<p>
{item.message}
</p>

</div>

))
}

</div>


</div>

);

}
