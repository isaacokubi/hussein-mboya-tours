export default function AIMarketing({
data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Marketing Campaign Generator
</h2>


<div className="grid md:grid-cols-3 gap-4 mb-6">


<div className="border rounded p-4">
Tours
<br/>
<b>
{data.businessMetrics?.tours || 0}
</b>
</div>


<div className="border rounded p-4">
Bookings
<br/>
<b>
{data.businessMetrics?.bookings || 0}
</b>
</div>


<div className="border rounded p-4">
Customers
<br/>
<b>
{data.businessMetrics?.customers || 0}
</b>
</div>


</div>



<div className="space-y-4">

{
(data.campaigns || []).map(
(campaign,index)=>(

<div
key={index}
className="border rounded-lg p-4"
>


<h3 className="font-bold">
{campaign.title}
</h3>


<p>
Target:
{campaign.audience}
</p>


<p>
Goal:
{campaign.objective}
</p>


<p>
Offer:
{campaign.offer}
</p>


<p className="text-gray-600">
{campaign.message}
</p>


</div>

))
}

</div>


</div>

);

}
