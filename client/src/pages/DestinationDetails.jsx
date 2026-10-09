import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Compass, Languages, CloudSun, CalendarDays, ArrowRight } from "lucide-react";
import { useTenant } from "../context/TenantContext";
import api from "../api/axios";
import SEO from "../components/seo/SEO";
import LazyImage from "../components/common/LazyImage";
import TourCard from "../components/tours/TourCard";

const DestinationDetails = () => {
  const { slug } = useParams();
  const { tenant = {} } = useTenant() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["destination", tenantKey, slug],
    queryFn: async () => {
      const res = await api.get(`/destinations/${slug}`);
      return res.data?.data?.destination || res.data?.destination || res.data?.data || null;
    },
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

  if (isLoading) return <main className="flex min-h-[60vh] items-center justify-center px-5" aria-live="polite">Loading destination…</main>;
  if (isError) return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 text-center"><h1 className="text-2xl font-bold">Destination guide temporarily unavailable</h1><p className="text-slate-600">Please try again shortly.</p><button type="button" onClick={() => refetch()} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Try again</button></main>;
  if (!data) return <main className="flex min-h-[60vh] items-center justify-center px-5"><div className="text-center"><h1 className="text-2xl font-bold">Destination not found</h1><p className="mt-2 text-slate-600">This destination is not published for the current travel company.</p><Link to="/destinations" className="mt-4 inline-block font-bold text-emerald-800">Browse destinations</Link></div></main>;

  const images = Array.isArray(data.images) ? data.images : [];
  const heroImage = images[0]?.url || images[0] || data.featuredImage || "";
  const destinationId = String(data._id || "");
  const tours = (Array.isArray(data.tours) ? data.tours : []).filter((tour) => {
    // A final UI guard against malformed or stale destination/tour associations.
    const tourDestination = tour?.destination?._id || tour?.destination;
    return Boolean(destinationId && tourDestination && String(tourDestination) === destinationId);
  });
  const attractions = Array.isArray(data.attractions) ? data.attractions.filter(Boolean) : [];
  const activities = Array.isArray(data.activities) ? data.activities.filter(Boolean) : [];
  const languages = Array.isArray(data.languages) ? data.languages.filter(Boolean) : [];
  const relatedDestinations = Array.isArray(data.relatedDestinations) ? data.relatedDestinations : [];
  const title = data.seo?.metaTitle || data.seo?.title || `${data.name} travel guide`;
  const description = data.seo?.metaDescription || data.seo?.description || data.shortDescription || data.description || `Explore ${data.name}, ${data.country || "East Africa"} with the tours and experiences published by this travel company.`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SEO title={title} description={description} keywords={Array.isArray(data.seo?.keywords) ? data.seo.keywords.join(", ") : ""} image={heroImage || undefined} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl bg-slate-200 shadow-sm ring-1 ring-slate-200">
            {heroImage ? <div className="h-[320px] sm:h-[450px]"><LazyImage src={heroImage} alt={data.name || "Destination"} className="h-full w-full object-cover" /></div> : <div className="grid h-[320px] place-items-center bg-gradient-to-br from-emerald-950 to-slate-700 text-white sm:h-[450px]"><MapPin size={48} aria-hidden="true" /><span className="sr-only">No destination photo provided</span></div>}
            {images.length > 1 && <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">{images.slice(1, 5).map((image, index) => <div key={image?._id || image?.url || String(image) || index} className="h-24 overflow-hidden rounded-xl"><LazyImage src={image?.url || image} alt={`${data.name} view ${index + 2}`} className="h-full w-full object-cover" /></div>)}</div>}
          </div>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            {data.featured && <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">Featured destination</span>}
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-800"><MapPin size={16} aria-hidden="true" />{[data.city, data.region, data.country].filter(Boolean).join(", ")}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{data.name}</h1>
            {data.shortDescription && <p className="mt-4 text-lg leading-7 text-slate-600">{data.shortDescription}</p>}
            {data.description && <p className="mt-5 whitespace-pre-line leading-7 text-slate-700">{data.description}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(data.bestSeason || data.weather) && <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><CloudSun size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Season & weather</p><p className="mt-1 text-sm font-semibold">{[data.bestSeason, data.weather].filter(Boolean).join(" · ")}</p>{Number.isFinite(Number(data.averageTemperature)) && data.averageTemperature !== null && <p className="mt-1 text-sm text-slate-600">Average temperature: {data.averageTemperature}°</p>}</div></div>}
              {(data.currency || data.timezone) && <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><CalendarDays size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Local information</p>{data.currency && <p className="mt-1 text-sm">Currency: {data.currency}</p>}{data.timezone && <p className="mt-1 text-sm">Time zone: {data.timezone}</p>}</div></div>}
            </div>
            <button type="button" onClick={() => navigate(`/tours?destination=${encodeURIComponent(destinationId)}`)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white hover:bg-emerald-900" disabled={!destinationId}>Explore tours <ArrowRight size={17} aria-hidden="true" /></button>
          </section>
        </div>

        {(attractions.length > 0 || activities.length > 0 || languages.length > 0) && <section className="mt-10 grid gap-5 md:grid-cols-3">
          {attractions.length > 0 && <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="flex items-center gap-2 text-lg font-extrabold"><MapPin size={18} />Places to explore</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">{attractions.map((item, index) => <li key={index}>• {item}</li>)}</ul></div>}
          {activities.length > 0 && <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Compass size={18} />Things to do</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">{activities.map((item, index) => <li key={index}>• {item}</li>)}</ul></div>}
          {languages.length > 0 && <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Languages size={18} />Languages</h2><p className="mt-4 text-sm leading-6 text-slate-700">{languages.join(", ")}</p></div>}
        </section>}

        {tours.length > 0 && <section className="mt-14"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">Plan your visit</p><h2 className="mt-2 text-3xl font-black">Tours in {data.name}</h2></div><Link to={`/tours?destination=${encodeURIComponent(destinationId)}`} className="font-bold text-emerald-800">View all tours</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <TourCard key={tour._id} tour={tour} />)}</div></section>}

        {relatedDestinations.length > 0 && <section className="mt-14"><h2 className="text-3xl font-black">More destinations</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relatedDestinations.map((item) => <Link key={item._id || item.slug} to={`/destinations/${item.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="h-40 overflow-hidden bg-slate-200"><LazyImage src={item.images?.[0]?.url || item.images?.[0] || item.featuredImage} alt={item.name || "Related destination"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-4"><h3 className="font-extrabold">{item.name}</h3><p className="mt-1 text-sm text-slate-500">{[item.region, item.country].filter(Boolean).join(", ")}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-800">Explore <ArrowRight size={14}/></span></div></Link>)}</div></section>}
      </div>
    </main>
  );
};

export default DestinationDetails;
