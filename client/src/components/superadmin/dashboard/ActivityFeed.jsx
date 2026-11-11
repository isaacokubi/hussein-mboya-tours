/**
 * Purpose: Activity Feed reusable UI component. Main declarations: ActivityFeed.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Declare activities for use by the surrounding module or function.
const activities=[
"New safari package created",
"Admin permission updated",
"Customer booking confirmed",
"M-Pesa payment received",
"System backup completed"
];

// Define ActivityFeed; its parameters and body implement this operation.
export default function ActivityFeed(){

// Return the expression shown below to the caller.
return (

<div className="bg-white rounded-xl border p-6">

<h3 className="font-bold mb-4">
Recent Activity
</h3>

<div className="space-y-3">

{activities.map((item,index)=>(

<div
key={index}
className="flex items-center gap-3 text-sm"
>

<div className="w-2 h-2 rounded-full bg-green-500"/>

<span>
{item}
</span>

</div>

))}

</div>

</div>

);

}
