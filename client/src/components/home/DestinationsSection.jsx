import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getFeaturedDestinations } from "../../api/destinationApi";
import LazyImage from "../common/LazyImage";

export default function DestinationsSection() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getFeaturedDestinations();
        const normalized = Array.isArray(data) ? data : Array.isArray(data?.destinations) ? data.destinations : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.destinations) ? data.data.destinations : [];
        if (mounted) setDestinations(normalized);
      } catch (error) {
        console.error("Failed to load destinations:", error);
        if (mounted) setDestinations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <section className="py-12" aria-live="polite"><div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200"/>)}</div></section>;
  if (!destinations.length) return <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">No destinations available right now.</section>;

  return (
    <section aria-labelledby="destinations-heading">
      <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-extrabold uppercase tracking-[.24em] text-emerald-700">Go further</p><h2 id="destinations-heading" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Explore Kenya’s iconic destinations</h2><p className="mt-2 max-w-2xl text-slate-500">Wildlife, coast, mountains and culture—choose your next place to experience.</p></div>
        <Link to="/destinations" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">See all destinations →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.slice(0,6).map((destination, index) => (
          <Link key={destination._id || destination.slug} to={`/destinations/${destination.slug}`}>
            <motion.article whileHover={{ y: -5 }} className="group relative h-80 overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
              <LazyImage src={typeof destination.images?.[0] === "string" ? destination.images[0] : destination.images?.[0]?.url || "/images/placeholder.jpg"} alt={destination.name || "Destination"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><MapPin size={14}/> Kenya & East Africa</div>
                <h3 className="mt-1 text-2xl font-black">{destination.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/75">{destination.description || "Discover an unforgettable Kenyan travel experience."}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white">Explore <ArrowUpRight size={15}/></span>
              </div>
            </motion.article>
          </Link>
        ))}
      </div>
    </section>
  );
}