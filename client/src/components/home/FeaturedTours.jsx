/**
 * Purpose: Featured Tours reusable UI component. Main declarations: FeaturedTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getTourImage, TOUR_FALLBACK_IMAGES } from "../../utils/tourImage";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import { ArrowRight, Clock3, MapPin, Star } from "lucide-react";
// Load ../../api/tourApi so this module can use its exported dependencies.
import { getFeaturedTours } from "../../api/tourApi";
// Load ../common/LazyImage so this module can use its exported dependencies.
import LazyImage from "../common/LazyImage";
// Load ../../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../../context/TenantContext";

// Define FeaturedTours; its parameters and body implement this operation.
export default function FeaturedTours() {
  // Declare { tenant = {} } for use by the surrounding module or function.
  const { tenant = {} } = useTenant() || {};
  // Declare tenantKey for use by the surrounding module or function.
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  // Declare { data, isLoading, isError, refetch } for use by the surrounding module or function.
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["featuredTours", tenantKey], queryFn: getFeaturedTours, staleTime: 1000 * 60 * 5 });
  // Declare tours for use by the surrounding module or function.
  const tours = Array.isArray(data) ? data : [];

  // Return the expression shown below to the caller.
  return (
    <section aria-labelledby="featured-tours-heading">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.24em] text-[#e3bd67]">Handpicked journeys</p>
          <h2 id="featured-tours-heading" className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Featured Kenya escapes</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Popular itineraries, ready to book or tailor with our travel team.</p>
        </div>
        <Link to="/tours" className="inline-flex items-center gap-2 text-sm font-bold text-[#e3bd67] hover:text-[#f0d38b]">View all tours <ArrowRight size={16}/></Link>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item)=><div key={item} className="h-96 animate-pulse rounded-3xl bg-white/10" />)}</div>
      ) : isError ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 text-sm text-amber-100" role="alert"><p className="font-bold">We are refreshing our travel inventory.</p><p className="mt-1 text-amber-100/70">Please try again shortly.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-[#e3bd67] px-4 py-2 font-bold text-slate-950 hover:bg-[#f0d38b]">Try Again</button></div>
      ) : tours.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-8 text-center text-slate-400">No featured tours are available right now.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, index) => {
            const fallbackImage = TOUR_FALLBACK_IMAGES[index % TOUR_FALLBACK_IMAGES.length];
            const rating = Number(tour?.rating ?? tour?.averageRating ?? 0);
            const reviewCount = Number(tour?.reviewCount ?? tour?.reviewsCount ?? 0);
            return (
              <article key={tour._id || tour.slug || index} className="group overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <LazyImage src={getTourImage(tour)} fallback={fallbackImage} alt={tour?.title || "Kenya tour"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-900">Featured</span>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold"><MapPin size={15}/> {tour?.destination?.name || "Kenya"}</span>
                    {tour?.duration && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85"><Clock3 size={14}/> {tour.duration} days</span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900">{tour?.title || "African Adventure"}</h3>
                  {rating > 0 && <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#8a6423]"><Star size={14} fill="currentColor" /> {rating.toFixed(1)}{reviewCount > 0 ? ` · ${reviewCount} reviews` : ""}</div>}
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">From</p><p className="text-xl font-black text-[#8a6423]">KES {Number(tour.price || 0).toLocaleString()}</p></div>
                    <Link to={`/tours/${tour?.slug || tour?._id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12372a]">View itinerary <ArrowRight size={15}/></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}