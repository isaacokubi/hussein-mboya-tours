import { useQuery } from "@tanstack/react-query";
import { CalendarRange, RefreshCw } from "lucide-react";
import { getItineraries } from "../../api/tourManagerApi";

export default function Itineraries() {
 const {data,isLoading,isError,refetch,isFetching}=useQuery({queryKey:["tour-manager-itineraries"],queryFn:getItineraries});
 const items=Array.isArray(data)?data:data?.itineraries||data?.data?.itineraries||data?.data||[];
 return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
  <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Itineraries</h1><p className="mt-1 text-slate-500">Review and coordinate day-by-day tour schedules.</p></div><button onClick={()=>refetch()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold">{isFetching?<RefreshCw className="animate-spin" size={17}/>:<RefreshCw size={17}/>}Refresh</button></header>
  {isLoading&&<div className="rounded-2xl bg-white p-8 shadow-sm">Loading itineraries...</div>}{isError&&<div className="rounded-2xl bg-red-50 p-6 text-red-700">Unable to load itineraries.</div>}
  {!isLoading&&!isError&&!items.length&&<div className="rounded-2xl bg-white p-10 text-center shadow-sm"><CalendarRange className="mx-auto" size={34}/><h2 className="mt-3 font-bold">No itineraries found</h2><p className="mt-1 text-slate-500">Create an itinerary from the tour workflow.</p></div>}
  <div className="grid gap-5 md:grid-cols-2">{items.map(x=><article key={x._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="font-bold">{x.title||x.name||"Tour itinerary"}</h2><p className="mt-2 text-sm text-slate-500">{x.description||x.summary||"No summary provided."}</p><div className="mt-4 text-sm text-slate-600">{x.tour?.title||x.tourName||"Tour not specified"}</div></article>)}</div>
 </div></div>;
}
