import React from "react";


export default function SuperAdminDashboard(){


return (

<div>


<h1>
Super Admin Control Center
</h1>


<p>
Global system administration and platform oversight.
</p>



<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginTop:"30px"
}}
>


<Card
title="Total Users"
value="29"
/>


<Card
title="Administrator Accounts"
value="System Managed"
/>


<Card
title="Roles & Permissions"
value="Active"
/>


<Card
title="System Security"
value="Protected"
/>


<Card
title="Database"
value="Healthy"
/>


<Card
title="API Services"
value="Online"
/>


<Card
title="Audit Logs"
value="Available"
/>


<Card
title="Platform Status"
value="Operational"
/>


</div>




<section
style={{
marginTop:"40px"
}}
>

<h2>
Security Center
</h2>

<ul>

<li>
Authentication monitoring
</li>

<li>
Administrator activity tracking
</li>

<li>
Permission enforcement
</li>

<li>
Audit trail management
</li>

</ul>


</section>





<section
style={{
marginTop:"40px"
}}
>

<h2>
Business Intelligence
</h2>


<p>
High-level business performance monitoring without operational management controls.
</p>


<div>

<p>
Revenue Overview
</p>

<p>
Booking Growth
</p>

<p>
Customer Growth
</p>


</div>


</section>





<section
style={{
marginTop:"40px"
}}
>

<h2>
System Administration
</h2>


<ul>

<li>
Manage administrators
</li>

<li>
Configure roles
</li>

<li>
Review permissions
</li>

<li>
Monitor infrastructure
</li>


</ul>


</section>



</div>

);


}



function Card({title,value}){


return (

<div
style={{
background:"#ffffff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 8px rgba(0,0,0,0.08)"
}}
>

<h3>
{title}
</h3>

<p>
{value}
</p>


</div>

);


}
