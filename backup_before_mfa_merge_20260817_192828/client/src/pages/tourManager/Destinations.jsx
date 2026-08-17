import { useQuery } from "@tanstack/react-query";
import { MapPinned, RefreshCw } from "lucide-react";
import { getDestinations } from "../../api/destinationApi";

export default function Destinations() {
 const {data=[],isLoading,isError,refetch,isFetching}=useQuery({queryKey:["manager-destinations"],queryFn:getDestinations});
 const items=Array.isArray(data)?data:[];
 return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
  <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Destinations</h1><p className="mt-1 text-slate-500">Explore published destinations when planning tours.</p></div><button onClick={()=>refetch()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold">{isFetching?<RefreshCw className="animate-spin" size={17}/>:<RefreshCw size={17}/>}Refresh</button></header>
  {isLoading&&<div className="rounded-2xl bg-white p-8 shadow-sm">Loading destinations...</div>}{isError&&<div className="rounded-2xl bg-red-50 p-6 text-red-700">Unable to load destinations.</div>}
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(x=><article key={x._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">{x.image&&<img src={x.image} alt={x.name||x.title||"Destination"} className="h-40 w-full object-cover"/>}<div className="p-5"><div className="flex items-center gap-2"><MapPinned size={18}/><h2 className="font-bold">{x.name||x.title}</h2></div><p className="mt-2 text-sm text-slate-500">{x.country||x.location||"Destination"}</p></div></article>)}</div>
 </div></div>;
}
