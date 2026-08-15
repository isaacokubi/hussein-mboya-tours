export default function AITourPricing({
data=[]
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Tour Pricing Optimizer
</h2>


<div className="space-y-4">

{
data.map(item=>(

<div
key={item.tourId}
className="border rounded-lg p-4"
>

<h3 className="font-bold">
{item.tour}
</h3>


<p>
Current Price:
KES {item.currentPrice}
</p>


<p>
Bookings:
{item.bookings}
</p>


<p className="font-semibold mt-2">
Recommendation:
{item.action}
</p>


<p className="text-gray-600">
{item.reason}
</p>


</div>

))
}

</div>


</div>

);

}
