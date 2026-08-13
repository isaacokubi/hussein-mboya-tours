import React from "react";

export default function SuperAdminAudit(){

const logs=[
"Admin login successful",
"Permission updated",
"Database backup completed"
];

return (
<div className="p-6">

<h1 className="text-2xl font-bold mb-6">
Audit Center
</h1>

<div className="space-y-3">

{logs.map((log,i)=>(
<div key={i}
className="border rounded-xl p-4 bg-white shadow"
>
{log}
</div>
))}

</div>

</div>
)

}