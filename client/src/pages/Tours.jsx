/**
 * Purpose: Tours page-level UI component. Main declarations: Tours, updateSearch.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useTenant } from "../context/TenantContext";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { useSearchParams } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { Search, SlidersHorizontal } from "lucide-react";
// Load ../components/tours/TourCard so this module can use its exported dependencies.
import TourCard from "../components/tours/TourCard";
// Load ../api/tourApi so this module can use its exported dependencies.
import { getTours } from "../api/tourApi";

// Define Tours; its parameters and body implement this operation.
export default function Tours() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare [searchParams, setSearchParams] for use by the surrounding module or function.
  const [searchParams, setSearchParams] = useSearchParams();
  // Declare destinationId for use by the surrounding module or function.
  const destinationId = searchParams.get("destination") || "";
  // Declare category for use by the surrounding module or function.
  const category = searchParams.get("category") || "";
  // Declare search for use by the surrounding module or function.
  const search = searchParams.get("search") || "";
  // Declare duration for use by the surrounding module or function.
  const duration = searchParams.get("duration") || "";
  // Declare travellers for use by the surrounding module or function.
  const travellers = searchParams.get("travellers") || "";
  // Declare page for use by the surrounding module or function.
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // Declare { data, isLoading, error } for use by the surrounding module or function.
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-tours", destinationId, category, search, duration, travellers, page],
    queryFn: () => getTours({
      ...(destinationId ? { destination: destinationId } : {}),
      ...(category ? { category } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(duration ? { duration } : {}),
      ...(travellers ? { travellers } : {}),
      page,
      limit: 24,
    }),
    placeholderData: (previousData) => previousData,
  });

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="min-h-[500px] bg-slate-950 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" /></div>;
  // Check the condition (error) and run the matching branch.
  if (error) return <div className="min-h-[400px] bg-slate-950 px-6 py-20 text-center text-white"><h2 className="text-2xl font-bold">We are refreshing our tour inventory.</h2><p className="mt-2 text-slate-400">Please try again shortly.</p></div>

  // Declare allTours for use by the surrounding module or function.
  const allTours = Array.isArray(data) ? data : data?.data || data?.tours || [];
  // Declare totalPages for use by the surrounding module or function.
  const totalPages = Number(data?.pagination?.pages || 1);
  // Declare tours for use by the surrounding module or function.
  const tours = (Array.isArray(allTours) ? allTours : []).filter((tour) => { const days = Number((tour?.durationDays ?? tour?.durationDetails?.days ?? String(tour?.duration || "").match(/\d+/)?.[0]) || 0); const withinDuration = !duration || (duration === "1-3" && days >= 1 && days <= 3) || (duration === "4-6" && days >= 4 && days <= 6) || (duration === "7+" && days >= 7); const capacity = Number(tour?.capacity ?? tour?.availabilitySettings?.totalSlots ?? 0); const withinTravellers = !travellers || !capacity || capacity >= Number(travellers); return withinDuration && withinTravellers; });

  // Declare updateSearch for use by the surrounding module or function.
  const updateSearch = (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Declare value for use by the surrounding module or function.
    const value = new FormData(event.currentTarget).get("search")?.toString().trim() || "";
    // Declare next for use by the surrounding module or function.
    const next = new URLSearchParams(searchParams);
    // Check the condition (value) and run the matching branch.
    if (value) next.set("search", value); else next.delete("search");
    // Perform the side effect or state update expressed on the following line.
    next.delete("page");
    // Perform the side effect or state update expressed on the following line.
    setSearchParams(next);
  };

  // Return the expression shown below to the caller.
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 p-7 shadow-2xl sm:p-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300"><SlidersHorizontal size={15} /> Travel marketplace</div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Explore your next adventure</h1>
          <p className="mt-4 max-w-2xl text-slate-300">Discover unforgettable African experiences with {settings?.companyName || tenant?.name || "Hussein Mboya Tours"}.</p>
          <form onSubmit={updateSearch} className="mt-7 flex flex-col gap-2 sm:flex-row">
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-white/10 px-5 ring-1 ring-white/10"><Search size={19} className="text-emerald-300" /><input name="search" defaultValue={search} placeholder="Search safari, beach, destination..." className="w-full bg-transparent outline-none placeholder:text-white/40" /></div>
            <button className="min-h-14 rounded-2xl bg-emerald-400 px-7 font-bold text-slate-950 hover:bg-emerald-300">Search tours</button>
          </form>
          {search && <p className="mt-4 text-sm text-emerald-300">Showing results for “{search}” · {tours.length} match{tours.length === 1 ? "" : "es"}</p>}
          {destinationId && <p className="mt-2 text-sm text-slate-400">Filtered by destination.</p>}
          {category && <p className="mt-1 text-sm text-slate-400">Category: {category}</p>}
          {duration && <p className="mt-1 text-sm text-slate-400">Duration: {duration} days</p>}
          {travellers && <p className="mt-1 text-sm text-slate-400">Travellers: {travellers}</p>}
        </div>

        {tours.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/[0.04] py-24 text-center"><h2 className="text-2xl font-bold">No tours found</h2><p className="mt-2 text-slate-400">Try another destination, activity or tour name.</p></div> : <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <TourCard key={tour._id} tour={tour} />)}</div>}
        {totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Tour pages">
          <button type="button" className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page - 1)); setSearchParams(next); }}>Previous</button>
          <span aria-live="polite" className="text-sm text-slate-300">Page {page} of {totalPages}</span>
          <button type="button" className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-40" disabled={page >= totalPages} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page + 1)); setSearchParams(next); }}>Next</button>
        </nav>}
      </div>
    </main>
  );
}
