import React,{createContext,useContext,useEffect,useState} from "react";

import {
getTenantBranding
} from "../api/tenantBrandingApi";


const TenantContext=createContext();


export function TenantProvider({children}){


const [tenant,setTenant]=useState({
name:"Hussein Mboya Tours",
currency:"KES",
timezone:"Africa/Nairobi"
});


useEffect(()=>{

loadTenant();

},[]);



async function loadTenant(){

try{

const res=await getTenantBranding();

if(res.branding){

setTenant(res.branding);


document.title=res.branding.name;


}

}catch(err){

console.error(
"Tenant branding load failed",
err
);

}

}


return (

<TenantContext.Provider
value={{
tenant,
setTenant
}}
>

{children}

</TenantContext.Provider>

);


}


export function useTenant(){

return useContext(TenantContext);

}

