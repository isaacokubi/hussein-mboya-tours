import React,{useEffect,useState} from "react";

export default function SecurityCenter(){

const [security,setSecurity]=useState(null);
const [events,setEvents]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{

Promise.all([
fetch("/api/security/status").then(r=>r.json()),
fetch("/api/security/events").then(r=>r.json())
])
.then(([status,eventData])=>{

setSecurity(status.data || {});
setEvents(eventData.data || []);

})
.catch(()=>{})
.finally(()=>setLoading(false));

},[]);


if(loading)
return (
<div className="p-8">
Checking security infrastructure...
</div>
);


return (

<div className="p-8 space-y-8">

<h1 className="text-3xl font-bold">
Security Center
</h1>


<div className="grid md:grid-cols-4 gap-5">

<div className="p-5 rounded-xl shadow bg-white">
<h3>Security Score</h3>
<p className="text-3xl">
{security?.securityScore || 0}/100
</p>
</div>


<div className="p-5 rounded-xl shadow bg-white">
<h3>Threat Level</h3>
<p className="text-3xl">
{security?.threatLevel}
</p>
</div>


<div className="p-5 rounded-xl shadow bg-white">
<h3>Authentication</h3>
<p>
{security?.authentication}
</p>
</div>


<div className="p-5 rounded-xl shadow bg-white">
<h3>Authorization</h3>
<p>
{security?.authorization}
</p>
</div>

</div>


<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">
Security Controls
</h2>

<ul>
<li>✓ JWT Authentication</li>
<li>✓ Role Based Access Control</li>
<li>✓ Audit Logging</li>
<li>✓ Session Monitoring</li>
<li>✓ API Protection</li>
</ul>

</div>


<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">
Recent Security Events
</h2>


{events.length===0 ?

<p>No security events</p>

:

events.map((event,index)=>(

<div key={index} className="border-b py-3">

{event.message}

</div>

))

}

</div>


</div>

);

}
