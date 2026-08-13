import React from "react";

export default function SuperAdminSecurity(){

const metrics={
Threats:"0",
Firewall:"Active",
Authentication:"Protected"
};

return (
<div className="p-6 space-y-6">

<h1 className="text-2xl font-bold">
Security Center
</h1>

<div className="grid md:grid-cols-3 gap-4">

{Object.entries(metrics).map(([a,b])=>(
<div className="rounded-xl border p-5 bg-white" key={a}>
<p className="text-gray-500">{a}</p>
<p className="font-bold text-xl">{b}</p>
</div>
))}

</div>

</div>
)

}