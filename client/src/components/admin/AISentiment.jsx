export default function AISentiment({
data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Customer Sentiment Intelligence
</h2>



<div className="grid md:grid-cols-4 gap-3 mb-6">


<div className="border rounded p-3">
Total Reviews
<br/>
<b>
{data.metrics?.totalReviews || 0}
</b>
</div>


<div className="border rounded p-3">
Positive
<br/>
<b>
{data.metrics?.positive || 0}
</b>
</div>


<div className="border rounded p-3">
Neutral
<br/>
<b>
{data.metrics?.neutral || 0}
</b>
</div>


<div className="border rounded p-3">
Negative
<br/>
<b>
{data.metrics?.negative || 0}
</b>
</div>


</div>



<h3 className="font-bold mb-3">
Customer Complaints
</h3>


<div className="space-y-3">

{
(data.complaints || []).map(
(item,index)=>(

<div
key={index}
className="border rounded-lg p-4"
>

<b>
{item.customer}
</b>

<p>
{item.comment}
</p>


</div>

))
}

</div>



<h3 className="font-bold mt-6">
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
