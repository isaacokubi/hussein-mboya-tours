
import React from "react";


export default function SuperAdminDashboard(){

const cards=[
["Total Users","29"],
["Administrators","System Managed"],
["Roles","Active"],
["Security","Protected"],
["Database","Healthy"],
["API Services","Online"],
["Audit Logs","Available"],
["Platform","Operational"]
];


return (

<div>

<h1>
Super Admin Control Center
</h1>

<p>
Global platform security, administration and business oversight.
</p>


<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
gap:"20px",
marginTop:"30px"
}}
>

{
cards.map((c,i)=>(

<div
key={i}
style={{
background:"white",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 3px 10px rgba(0,0,0,.08)"
}}
>

<h3>{c[0]}</h3>

<p>
{c[1]}
</p>

</div>

))
}

</div>



<h2 style={{marginTop:"40px"}}>
Security Center
</h2>

<ul>
<li>Authentication monitoring</li>
<li>Administrator activity tracking</li>
<li>Permission enforcement</li>
<li>Audit trail management</li>
</ul>


<h2>
Business Intelligence
</h2>

<ul>
<li>Revenue Overview</li>
<li>Booking Growth</li>
<li>Customer Growth</li>
</ul>


<h2>
Infrastructure
</h2>

<ul>
<li>API monitoring</li>
<li>Database health</li>
<li>System performance</li>
</ul>


</div>

);

}
