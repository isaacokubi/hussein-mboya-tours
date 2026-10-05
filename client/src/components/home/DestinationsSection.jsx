import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getFeaturedDestinations } from "../../api/destinationApi";
import LazyImage from "../common/LazyImage";
import { useTenant } from "../../context/TenantContext";

export default function DestinationsSection() {
  const { tenant = {} } = useTenant() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["featuredDestinations", tenantKey], queryFn: getFeaturedDestinations, staleTime: 1000 * 60 * 10 });
  const destinations = Array.isArray(data) ? data : [];
  if (isLoading) return <section className="py-12" aria-live="polite"><div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i)=><div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200"/>)}</div></section>;
  if (isError) return <section className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center text-amber-900" role="alert"><p className="font-bold">We are refreshing our destination guide.</p><p className="mt-2 text-sm text-amber-800/80">Please try again shortly.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-[#12372a] px-4 py-2 font-bold text-white hover:bg-[#1b4d3b]">Try Again</button></section>;
  if (!destinations.length) return <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">No destinations are currently published for this travel company.</section>;
  return <section aria-labelledby="destinations-heading">
    <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.24em] text-[#8a6423]">Go further</p><h2 id="destinations-heading" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Explore Kenya’s iconic destinations</h2><p className="mt-2 max-w-2xl text-slate-500">Wildlife, coast, mountains and culture—choose your next place to experience.</p></div><Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-[#8a6423] hover:text-[#684a18]">See all destinations <ArrowUpRight size={16}/></Link></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{destinations.slice(0,6).map((destination)=><Link key={destination._id || destination.slug} to={`/destinations/${destination.slug}`} className="group"><article className="relative h-80 overflow-hidden rounded-3xl bg-slate-900 shadow-lg transition hover:-translate-y-1"><LazyImage src={typeof destination.images?.[0] === "string" ? destination.images[0] : destination.images?.[0]?.url} alt={destination.name || "Kenya destination"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent"/><div className="absolute bottom-0 left-0 right-0 p-6 text-white"><div className="flex items-center gap-1.5 text-xs font-semibold text-[#e3bd67]"><MapPin size={14}/> Kenya & East Africa</div><h3 className="mt-1 text-2xl font-black">{destination.name}</h3>{destination.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/75">{destination.description}</p>}</div></article></Link>)}</div>
  </section>;
}
