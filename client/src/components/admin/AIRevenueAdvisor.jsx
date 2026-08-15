export default function AIRevenueAdvisor({
  data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Revenue & Marketing Advisor
</h2>



<div className="grid md:grid-cols-3 gap-4 mb-5">


<div className="p-4 rounded-lg bg-gray-50">

<p className="text-gray-500">
Bookings
</p>

<p className="text-2xl font-bold">
{data.metrics?.totalBookings || 0}
</p>

</div>



<div className="p-4 rounded-lg bg-gray-50">

<p className="text-gray-500">
Revenue
</p>

<p className="text-2xl font-bold">
KES {data.metrics?.totalRevenue || 0}
</p>

</div>



<div className="p-4 rounded-lg bg-gray-50">

<p className="text-gray-500">
Tours
</p>

<p className="text-2xl font-bold">
{data.metrics?.totalTours || 0}
</p>

</div>


</div>



<h3 className="font-bold mb-2">
AI Recommendations
</h3>


<ul className="list-disc ml-5 space-y-2">

{
(data.recommendations || [])
.map((item,index)=>(

<li key={index}>
{item}
</li>

))
}

</ul>


</div>

);

}
