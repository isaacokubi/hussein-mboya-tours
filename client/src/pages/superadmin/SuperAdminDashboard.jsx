import { useQuery } from "@tanstack/react-query";
import { getSuperAdminDashboard } from "../../api/superAdminApi";

const cards = [
 ["users","Users"],["staff","Staff"],["agents","Agents"],["vehicles","Vehicles"],
 ["bookings","Bookings"],["admins","Administrators"]
];

export default function SuperAdminDashboard(){
 const {data,isLoading,isError,error,refetch}=useQuery({
  queryKey:["superadmin-dashboard"],
  queryFn:getSuperAdminDashboard,
  retry:false,
  staleTime:30000,
  refetchOnMount:true
 });

 const stats=data?.stats || {};

 if(isLoading) return <div className="p-8">Loading Super Admin Control Center...</div>;

 if(isError) {
  const unauthorized = error?.response?.status === 401;
  return (
   <main className="p-8 bg-gray-50 min-h-screen">
    <div className="bg-white rounded-2xl border p-8">
     <h1 className="text-2xl font-bold">Super Admin Control Center</h1>
     <p className="mt-3 text-gray-600">
      {unauthorized
       ? "Your Super Admin session has expired. Please login again."
       : "Unable to load platform metrics."}
     </p>
     <button className="mt-5 underline" onClick={()=>refetch()}>Retry</button>
    </div>
   </main>
  );
 }

 return <main className="p-6 space-y-8 bg-gray-50 min-h-screen">
  <header>
   <h1 className="text-3xl font-bold">Global Tours Platform Control Center</h1>
   <p className="text-gray-600">Live platform operations, security and business monitoring.</p>
  </header>
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
   {cards.map(([key,label])=>(
    <article key={key} className="bg-white rounded-2xl shadow border p-6">
     <p className="text-gray-500">{label}</p>
     <h2 className="text-4xl font-bold mt-3">{stats[key] ?? 0}</h2>
     <p className="text-xs text-gray-400 mt-2">Live database count</p>
    </article>
   ))}
  </div>
 </main>;
}
