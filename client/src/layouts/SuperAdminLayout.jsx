import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";


export default function SuperAdminLayout(){

return (

<div
style={{
display:"flex",
minHeight:"100vh"
}}
>

<SuperAdminSidebar />

<div
style={{
flex:1,
padding:"25px"
}}
>

<Outlet />

</div>


</div>

);

}
