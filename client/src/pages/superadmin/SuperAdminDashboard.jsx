import React, {useEffect,useState} from "react";
import {getSuperAdminDashboard} from "../../api/superAdminApi";

const Card=({title,value})=>(
<div style={{
padding:"20px",
borderRadius:"12px",
background:"#fff",
boxShadow:"0 2px 8px rgba(0,0,0,.1)"
}}>
<h4>{title}</h4>
<h2>{value}</h2>
</div>
);


export default function SuperAdminDashboard(){

const [data,setData]=useState(null);
const [error,setError]=useState("");

useEffect(()=>{

getSuperAdminDashboard()
.then(setData)
.catch(e=>setError(e.message));

},[]);


if(error)
return <div>{error}</div>;


if(!data)
return <div>Loading Super Admin Dashboard...</div>;


const stats=data.stats || {};


return (

<div style={{padding:"25px"}}>

<h1>
Super Admin Control Center
</h1>


<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px"
}}>


<Card title="Users" value={stats.users || 0}/>

<Card title="Staff" value={stats.staff || 0}/>

<Card title="Admins" value={stats.admins || 0}/>

<Card title="Agents" value={stats.agents || 0}/>

<Card title="Guides" value={stats.guides || 0}/>

<Card title="Vehicles" value={stats.vehicles || 0}/>

<Card title="Bookings" value={stats.bookings || 0}/>


</div>


</div>

);

}
