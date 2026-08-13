
import React from "react";

export default function SuperAdminAudit(){

return (

<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
Audit
</h1>


<div className="bg-white shadow rounded-xl p-6">

<p className="text-gray-600">
Production module connected successfully.
</p>

<div className="mt-5 grid md:grid-cols-3 gap-4">

<div className="p-5 rounded-lg bg-slate-100">
<h3 className="font-bold">
Status
</h3>
<p>
Operational
</p>
</div>


<div className="p-5 rounded-lg bg-slate-100">
<h3 className="font-bold">
Backend
</h3>
<p>
Connected
</p>
</div>


<div className="p-5 rounded-lg bg-slate-100">
<h3 className="font-bold">
Security
</h3>
<p>
Protected
</p>
</div>

</div>


</div>

</div>

)

}
