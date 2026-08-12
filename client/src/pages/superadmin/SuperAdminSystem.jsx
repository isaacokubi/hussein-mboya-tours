import React,{useEffect,useState} from "react";
import { getSystemHealth } from "../../api/superAdminApi";
export default function Page(){
 const [data,setData]=useState(null); const [error,setError]=useState("");
 useEffect(()=>{getSystemHealth().then(setData).catch(e=>setError(e.message))},[]);
 return <section className="space-y-6"><h1 className="text-3xl font-black">System Health</h1><p className="text-gray-500">Monitor server and service health.</p>{error&&<div className="text-red-600">{error}</div>}<pre className="bg-white rounded-xl p-6 overflow-auto">{JSON.stringify(data,null,2)}</pre></section>
}
