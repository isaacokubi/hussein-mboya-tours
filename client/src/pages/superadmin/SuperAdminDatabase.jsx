import React,{useEffect,useState} from "react";
import { getDatabaseStatus } from "../../api/superAdminApi";
export default function Page(){
 const [data,setData]=useState(null); const [error,setError]=useState("");
 useEffect(()=>{getDatabaseStatus().then(setData).catch(e=>setError(e.message))},[]);
 return <section className="space-y-6"><h1 className="text-3xl font-black">Database Tools</h1><p className="text-gray-500">Database status and operational tools.</p>{error&&<div className="text-red-600">{error}</div>}<pre className="bg-white rounded-xl p-6 overflow-auto">{JSON.stringify(data,null,2)}</pre></section>
}
