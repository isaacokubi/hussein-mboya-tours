
import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";

export default function SuperAdminLayout(){

return (

<div
style={{
display:"flex",
minHeight:"100vh",
background:"#f4f6f8"
}}
>

<SuperAdminSidebar />

<main
style={{
flex:1,
padding:"30px",
overflowY:"auto"
}}
>

<Outlet />

</main>


</div>

);

}
