import React from "react";

const activities=[
"New safari package created",
"Admin permission updated",
"Customer booking confirmed",
"M-Pesa payment received",
"System backup completed"
];

export default function ActivityFeed(){

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
