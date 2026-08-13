import React from "react";

export default function SuperAdminSystem(){

const data={
 status:"Operational",
 uptime:"99.99%",
 services:12,
 servers:"Healthy"
};

return (
<div className="p-6 space-y-6">

<h1 className="text-2xl font-bold">
System Health Center
</h1>

<div className="grid md:grid-cols-4 gap-4">

{Object.entries(data).map(([key,value])=>(
<div
key={key}
className="rounded-xl border bg-white p-5 shadow"
>

<p className="text-sm text-gray-500 uppercase">
{key}
</p>

<p className="text-xl font-bold mt-2">
{value}
</p>

</div>
))}

</div>

<div className="rounded-xl bg-slate-50 border p-5">

<h2 className="font-semibold mb-3">
System Information
</h2>

<pre className="overflow-auto text-sm">
{JSON.stringify(data,null,2)}
</pre>

</div>

</div>
)

}