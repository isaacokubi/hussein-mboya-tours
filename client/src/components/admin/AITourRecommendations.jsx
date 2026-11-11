/**
 * Purpose: AITour Recommendations reusable UI component. Main declarations: AITourRecommendations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function AITourRecommendations({
data=[]
}){


// Return the expression shown below to the caller.
return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Tour Recommendation Engine
</h2>


<div className="space-y-3">

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
Destination:
{item.destination}
</p>


<p>
Price:
KES {item.price}
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
