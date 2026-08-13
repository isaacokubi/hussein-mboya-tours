import { useQuery } from "@tanstack/react-query";
import { getSuperAdminDashboard } from "../../api/superAdminApi";

const cards = [
 ["users","Users"],["staff","Staff"],["agents","Agents"],["vehicles","Vehicles"],
 ["bookings","Bookings"],["admins","Administrators"]
];

export default function SuperAdminDashboard(){
 const {data,isLoading,isError,error,refetch}=useQuery({
  queryKey:["superadmin-dashboard"], queryFn:getSuperAdminDashboard,
  retry:2, staleTime:0, refetchOnMount:"always", refetchOnWindowFocus:true
 });
 const stats=data?.stats||{};
 if(isLoading) return <div className="p-8">Loading SuperAdmin Control Center...</div>;
 if(isError) return <div className="p-8 bg-red-50 text-red-700 rounded-xl">
 Dashboard API error: {error?.message||"Unable to connect"} <button className="ml-4 underline" onClick={()=>refetch()}>Retry</button>
 </div>;
 return <main className="p-6 space-y-8 bg-gray-50 min-h-screen">
 <header><h1 className="text-3xl font-bold">SuperAdmin Control Center</h1>
 <p className="text-gray-600">Live platform operations, users, security and business monitoring.</p></header>
 <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
 {cards.map(([key,label])=><article key={key} className="bg-white rounded-2xl shadow border p-6">
 <p className="text-gray-500">{label}</p><h2 className="text-4xl font-bold mt-3">{stats[key]??0}</h2>
 <p className="text-xs text-gray-400 mt-2">Live database count</p></article>)}
 </div>
 <section className="bg-white rounded-2xl border p-6">
 <h2 className="text-xl font-semibold">System Overview</h2>
 <p className="text-gray-600 mt-2">Dashboard data is loaded from protected SuperAdmin APIs.</p>
 </section>
 </main>
}
