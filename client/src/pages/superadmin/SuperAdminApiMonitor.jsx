import React from "react";

export default function SuperAdminApiMonitor(){

const api={
status:"Online",
requests:"Normal",
latency:"120ms"
};

return (
<div className="p-6 space-y-6">

<h1 className="text-2xl font-bold">
API Monitor
</h1>

<div className="grid md:grid-3 gap-4">

{Object.entries(api).map(([k,v])=>(
<div key={k}
className="border rounded-xl p-5 bg-white">

<p>{k}</p>
<strong>{v}</strong>

</div>
))}

</div>

</div>
)

}