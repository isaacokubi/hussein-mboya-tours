
import React,{useEffect,useState} from "react";
import api from "../../api/axios";

export default function SuperAdminSecurity(){

const [data,setData]=useState(null);
const [error,setError]=useState("");

useEffect(()=>{
 load();
},[]);

async function load(){
 try{
  const res=await api.get("/superadmin-tools/security");
  setData(res.data);
 }
 catch(e){
  setError(e.message);
 }
}

return (
<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
Security Center
</h1>

<div className="bg-white rounded-xl shadow p-6">

{
error ?
<p className="text-red-600">{error}</p>
:
<pre className="overflow-auto text-sm">
{JSON.stringify(data,null,2)}
</pre>
}

</div>

</div>
)

}
