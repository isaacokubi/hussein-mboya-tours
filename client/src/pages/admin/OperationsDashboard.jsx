import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Car, CheckCircle2, Users, UserRound } from "lucide-react";
import { getOperationsOverview } from "../../api/operationsApi";

export default function OperationsDashboard(){
 const {data,isLoading,isError}=useQuery({queryKey:["operations-overview"],queryFn:getOperationsOverview,refetchInterval:60000});
 const p=data?.data||{}; const s=p.stats||{};
 if(isLoading)return <div className="p-8">Loading operations dashboard...</div>;
 if(isError)return <div className="p-8 text-red-600">Unable to load operations data.</div>;
 const cards=[["Today trips",s.todayTrips||0,CalendarDays],["Available vehicles",s.availableVehicles||0,Car],["Available guides",s.availableGuides||0,Users],["Available drivers",s.availableDrivers||0,UserRound],["Resource coverage",`${s.resourceCoverage||0}%`,CheckCircle2]];
 return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
  <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tour delivery</p><h1 className="text-3xl font-bold">Operations Dashboard</h1><p className="mt-1 text-slate-500">Coordinate confirmed bookings, vehicles, guides and drivers from one operational view.</p></div>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={19} className="text-emerald-700"/></div><div className="mt-3 text-2xl font-bold">{value}</div></div>)}</div>
  <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Upcoming trip schedule</h2><span className="text-sm text-slate-500">{p.schedule?.length||0} trips</span></div>
   <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Tour</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Payment</th></tr></thead><tbody>{(p.schedule||[]).map(b=><tr key={b._id} className="border-t"><td className="p-3">{b.travelDate?new Date(b.travelDate).toLocaleDateString():"—"}</td><td className="p-3 font-semibold">{b.tour?.title||"Tour"}</td><td className="p-3">{b.user?.name||b.customerSnapshot?.name||b.contact?.name||"Customer"}</td><td className="p-3 capitalize">{b.status||"pending"}</td><td className="p-3 capitalize">{b.paymentStatus||"pending"}</td></tr>)}{!(p.schedule||[]).length&&<tr><td colSpan="5" className="p-8 text-center text-slate-500">No upcoming trips.</td></tr>}</tbody></table></div>
  </div>
  <div className="mt-6 grid gap-6 md:grid-cols-3">{[["Vehicles",p.vehicles||[]],["Guides",p.guides||[]],["Drivers",p.drivers||[]]].map(([title,list])=><div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="font-bold">{title}</h2><div className="mt-4 space-y-2">{list.slice(0,8).map(x=><div key={x._id} className="flex justify-between rounded-lg bg-slate-50 p-3"><span>{x.name||x.registrationNumber||x.plateNumber||x.email}</span><span className="text-xs capitalize text-slate-500">{x.status||x.availability||"ready"}</span></div>)}{!list.length&&<p className="text-sm text-slate-500">No resources found.</p>}</div></div>)}</div>
 </div></div>
}
