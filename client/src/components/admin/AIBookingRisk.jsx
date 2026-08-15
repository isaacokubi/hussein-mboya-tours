export default function AIBookingRisk({
  data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Booking Risk Detector
</h2>


<div className="grid md:grid-cols-4 gap-3 mb-5">


<div className="p-3 bg-gray-50 rounded">
Pending
<br/>
<b>{data.metrics?.pendingBookings || 0}</b>
</div>


<div className="p-3 bg-gray-50 rounded">
Cancelled
<br/>
<b>{data.metrics?.cancelledBookings || 0}</b>
</div>


<div className="p-3 bg-gray-50 rounded">
Unpaid
<br/>
<b>{data.metrics?.unpaidBookings || 0}</b>
</div>


<div className="p-3 bg-gray-50 rounded">
Old Pending
<br/>
<b>{data.metrics?.oldPendingBookings || 0}</b>
</div>


</div>



<h3 className="font-bold mb-2">
Detected Risks
</h3>


<div className="space-y-3">

{
(data.risks || []).map((risk,index)=>(

<div
key={index}
className="border rounded-lg p-4"
>

<p className="font-bold">
{risk.title}
</p>

<p>
{risk.message}
</p>

</div>

))
}

</div>


</div>

);

}
