export default function AIOperationsCenter({
data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-2xl font-bold mb-5">
AI Operations Command Center
</h2>



<div className="mb-6">

Health Score

<div className="text-4xl font-bold">
{data.healthScore || 0}/100
</div>

</div>



<div className="grid md:grid-cols-6 gap-3 mb-6">


<div className="border rounded p-3">
Bookings
<br/>
<b>{data.metrics?.totalBookings || 0}</b>
</div>


<div className="border rounded p-3">
Pending
<br/>
<b>{data.metrics?.pendingBookings || 0}</b>
</div>


<div className="border rounded p-3">
Confirmed
<br/>
<b>{data.metrics?.confirmedBookings || 0}</b>
</div>


<div className="border rounded p-3">
Revenue
<br/>
<b>
KES {data.metrics?.revenue || 0}
</b>
</div>


<div className="border rounded p-3">
Vehicles
<br/>
<b>
{data.metrics?.availableVehicles || 0}
</b>
</div>


<div className="border rounded p-3">
Rating
<br/>
<b>
{data.metrics?.customerRating || 0}
</b>
</div>


</div>



<h3 className="font-bold">
AI Alerts
</h3>


<div className="space-y-3">

{
(data.alerts || []).map(
(alert,index)=>(

<div
key={index}
className="border rounded p-4"
>

<b>
{alert.title}
</b>

<p>
{alert.message}
</p>

</div>

))
}

</div>



<h3 className="font-bold mt-6">
Recommended Actions
</h3>


<ul className="list-disc ml-6">

{
(data.recommendedActions || [])
.map(
(action,index)=>(

<li key={index}>
{action}
</li>

))
}

</ul>


</div>

);

}
