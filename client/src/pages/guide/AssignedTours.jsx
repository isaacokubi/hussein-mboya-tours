import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users, RefreshCw } from "lucide-react";
import { getAssignedTours } from "../../api/guideApi";

export default function AssignedTours() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["guide-assigned-tours"],
    queryFn: getAssignedTours,
  });
  const tours = Array.isArray(data) ? data : data?.tours || data?.data?.tours || data?.data || [];
  return <div className="min-h-screen bg-slate-50 p-4 md:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-slate-900">Assigned Tours</h1><p className="mt-1 text-slate-500">Manage tours assigned to you and review departure details.</p></div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold">{isFetching ? <RefreshCw className="animate-spin" size={17}/> : <RefreshCw size={17}/>} Refresh</button>
      </header>
      {isLoading && <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading assigned tours...</div>}
      {isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load assigned tours. Please refresh and try again.</div>}
      {!isLoading && !isError && !tours.length && <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><h2 className="text-lg font-bold">No assigned tours</h2><p className="mt-2 text-slate-500">New assignments will appear here.</p></div>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => <article key={tour._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{tour.title || tour.name || tour.tour?.title || "Assigned tour"}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{tour.status || "assigned"}</span></div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p className="flex gap-2"><CalendarDays size={17}/>{tour.travelDate || tour.startDate ? new Date(tour.travelDate || tour.startDate).toLocaleDateString() : "Date not set"}</p>
            <p className="flex gap-2"><MapPin size={17}/>{tour.location || tour.destination?.name || tour.destination || "Location not set"}</p>
            <p className="flex gap-2"><Users size={17}/>{tour.numberOfGuests || tour.guestsCount || tour.capacity || 0} guests</p>
          </div>
        </article>)}
      </div>
    </div>
  </div>;
}
