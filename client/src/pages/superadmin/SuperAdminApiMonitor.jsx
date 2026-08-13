
import React,{useEffect,useState} from "react";
import api from "../../api/axios";

export default function SuperAdminApiMonitor(){

const [data,setData]=useState(null);
const [error,setError]=useState("");

useEffect(()=>{
 load();
},[]);

async function load(){
 try{
  const res=await api.get("/superadmin-tools/api-monitor");
  setData(res.data);
 }
 catch(e){
  setError(e.message);
 }
}

return (
<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
API Monitor
</h1>

<div className="bg-white rounded-xl shadow p-6">

{
error ?
<p className="text-red-600">{error}</p>
:
<pre className="overflow-auto text-sm">

<div className="bg-white shadow rounded-xl p-6">
<h2 className="text-xl font-bold mb-4">
API Monitor
</h2>

<pre className="text-sm">
{JSON.stringify(data,null,2)}
</div>
</div>

</div>

</pre>
}

</div>

</div>
)

}
