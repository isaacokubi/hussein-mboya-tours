import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import TourCard from "../components/tours/TourCard";
import { getTours } from "../api/tourApi";

const textOf = (value) => String(value?.name || value?.title || value || "").toLowerCase();

export default function Tours() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const destinationId = searchParams.get("destination") || "";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const companyName = settings?.companyName || tenant?.name || "Tours & Travel";

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-tours", destinationId, category],
    queryFn: () => getTours({ ...(destinationId ? { destination: destinationId } : {}), ...(category ? { category } : {}) }),
  });

  if (isLoading) return <div className="min-h-[500px] bg-slate-950 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" /></div>;
  if (error) return <div className="min-h-[400px] bg-slate-950 px-6 py-20 text-center text-red-400">Failed to load tours.</div>;

  const allTours = Array.isArray(data) ? data : data?.data || [];
  const normalizedSearch = search.trim().toLowerCase();
  const tours = normalizedSearch ? allTours.filter((tour) => [tour.title, tour.name, tour.description, tour.shortDescription, tour.location, tour.destination, tour.category, tour.slug].map(textOf).some((value) => value.includes(normalizedSearch))) : allTours;
  const updateSearch = (event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get("search")?.toString().trim() || ""; const next = new URLSearchParams(searchParams); if (value) next.set("search", value); else next.delete("search"); setSearchParams(next); };

  return <main className="min-h-screen bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8"><div className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 p-7 shadow-2xl sm:p-10"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300"><SlidersHorizontal size={15} /> Travel marketplace</div><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Explore your next adventure</h1><p className="mt-4 max-w-2xl text-slate-300">Discover unforgettable African experiences with {companyName}.</p><form onSubmit={updateSearch} className="mt-7 flex flex-col gap-2 sm:flex-row"><div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-white/10 px-5 ring-1 ring-white/10"><Search size={19} className="text-emerald-300" /><input name="search" defaultValue={search} placeholder="Search safari, beach, destination..." className="w-full bg-transparent outline-none placeholder:text-white/40" /></div><button className="min-h-14 rounded-2xl bg-emerald-400 px-7 font-bold text-slate-950 hover:bg-emerald-300">Search tours</button></form>{search && <p className="mt-4 text-sm text-emerald-300">Showing results for “{search}” · {tours.length} match{tours.length === 1 ? "" : "es"}</p>}{destinationId && <p className="mt-2 text-sm text-slate-400">Filtered by destination.</p>}{category && <p className="mt-1 text-sm text-slate-400">Category: {category}</p>}</div>{tours.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/[0.04] py-24 text-center"><h2 className="text-2xl font-bold">No tours found</h2><p className="mt-2 text-slate-400">Try another destination, activity or tour name.</p></div> : <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <TourCard key={tour._id} tour={tour} />)}</div>}</div></main>;
}
