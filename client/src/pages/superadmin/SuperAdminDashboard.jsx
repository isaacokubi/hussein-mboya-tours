import React,{useEffect,useState} from "react";
import {Users,Map,ShieldCheck,Database,Activity,WalletCards} from "lucide-react";
import {getSuperAdminDashboard} from "../../api/superAdminApi";

const Card=({title,value,icon:Icon})=><div className="bg-white rounded-2xl border shadow-sm p-6"><div className="flex justify-between text-gray-500"><span>{title}</span><Icon/></div><div className="text-3xl font-black mt-4">{value}</div></div>;

export default function SuperAdminDashboard(){
 const [data,setData]=useState(null);
 const [error,setError]=useState("");
 useEffect(()=>{getSuperAdminDashboard().then(setData).catch(e=>setError(e.message))},[]);
 const s=data?.stats||{};
 return <section className="space-y-8">
 <header><h1 className="text-4xl font-black">Super Admin Control Center</h1><p className="text-gray-500">Live platform governance and operations.</p></header>
 {error&&<div className="p-4 bg-red-50 text-red-600">{error}</div>}
 <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
 <Card title="Users" value={s.users??"Loading..."} icon={Users}/>
 <Card title="Bookings" value={s.bookings??"Loading..."} icon={Map}/>
 <Card title="Administrators" value={s.admins??"Loading..."} icon={ShieldCheck}/>
 <Card title="Vehicles" value={s.vehicles??"Loading..."} icon={Database}/>
 </div>
 <div className="grid md:grid-cols-3 gap-5">
 <Card title="Staff" value={s.staff??0} icon={Activity}/>
 <Card title="Agents" value={s.agents??0} icon={WalletCards}/>
 </div>
 </section>
}
