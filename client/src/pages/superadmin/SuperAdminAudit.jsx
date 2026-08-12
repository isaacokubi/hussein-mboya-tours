import React from "react";

export default function SuperAdminAudit(){

return (

<div>

<h1>
Audit Logs
</h1>

<p>
Track important platform activities, administrator actions and security events.
</p>


<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginTop:"30px"
}}
>

<Card title="Total Events" value="Monitoring Active" />

<Card title="Admin Actions" value="Tracked" />

<Card title="Security Events" value="Protected" />

</div>


</div>

);

}


function Card({title,value}){

return (

<div
style={{
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 2px 8px rgba(0,0,0,.08)"
}}
>

<h3>{title}</h3>

<p>{value}</p>

</div>

);

}
