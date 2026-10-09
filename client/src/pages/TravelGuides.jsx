import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Tag } from "lucide-react";
import { getPublicTravelGuide, getPublicTravelGuides } from "../api/travelGuideApi";
import { useTenant } from "../context/TenantContext";
import SEO from "../components/seo/SEO";

const dateLabel = (value, locale = "en-KE", timeZone = "Africa/Nairobi") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try { return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", timeZone }); }
  catch { return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }); }
};

export default function TravelGuides() {
  const { slug } = useParams();
  const { tenant = {} } = useTenant() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  const detailQuery = useQuery({
    queryKey: ["public-travel-guide", tenantKey, slug],
    queryFn: () => getPublicTravelGuide(slug),
    enabled: Boolean(slug),
    retry: 1,
  });
  const listQuery = useQuery({
    queryKey: ["public-travel-guides", tenantKey],
    queryFn: () => getPublicTravelGuides(),
    enabled: !slug,
    staleTime: 60000,
  });
  const companyName = tenant.name || tenant.companyName || "Travel company";
  const settingsLocale = tenant.language === "sw" ? "sw-KE" : "en-KE";
  const timeZone = tenant.timezone || "Africa/Nairobi";

  if (slug && detailQuery.isLoading) return <main className="mx-auto min-h-96 max-w-4xl px-5 py-16" aria-live="polite">Loading travel guide…</main>;
  if (slug && (detailQuery.isError || !detailQuery.data)) return <main className="mx-auto min-h-96 max-w-4xl px-5 py-16"><h1 className="text-3xl font-black">Travel guide not found</h1><p className="mt-3 text-slate-600">This article is not published for {companyName}, or it may have been removed.</p><Link className="mt-6 inline-flex items-center gap-2 font-bold text-emerald-800" to="/travel-guides"><ArrowLeft size={17}/> All travel guides</Link></main>;

  if (slug) {
    const guide = detailQuery.data;
    return <main className="min-h-screen bg-slate-50 text-slate-900"><SEO title={guide.seoTitle || guide.title} description={guide.seoDescription || guide.excerpt} url={`/travel-guides/${guide.slug}`} image={guide.coverImage || undefined} structuredData={{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.seoDescription || guide.excerpt || "", image: guide.coverImage ? [guide.coverImage] : undefined, datePublished: guide.publishedAt || undefined, dateModified: guide.updatedAt || undefined, articleSection: guide.category || undefined, keywords: guide.tags?.length ? guide.tags.join(", ") : undefined }} /><article className="mx-auto max-w-4xl px-5 py-10 sm:px-8"><Link className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800" to="/travel-guides"><ArrowLeft size={17}/> All travel guides</Link>{guide.coverImage && <img src={guide.coverImage} alt={guide.title} className="mt-6 max-h-[480px] w-full rounded-3xl object-cover" loading="eager" onError={(event) => { event.currentTarget.style.display = "none"; }}/>}<p className="mt-8 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-800"><BookOpen size={15}/>{guide.category || "Travel tips"}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{guide.title}</h1>{guide.publishedAt && <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15}/>{dateLabel(guide.publishedAt, settingsLocale, timeZone)}</p>}{guide.excerpt && <p className="mt-6 text-xl leading-8 text-slate-600">{guide.excerpt}</p>}<div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">{guide.content}</div>{guide.tags?.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{guide.tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><Tag size={12}/>{tag}</span>)}</div>}</article></main>;
  }

  return <main className="min-h-screen bg-slate-50 text-slate-900"><SEO title="Travel guides" description={`Travel tips, destination advice and trip-planning guides from ${companyName}.`} url="/travel-guides"/><section className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-extrabold uppercase tracking-[.22em] text-emerald-300">Plan with confidence</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Travel guides from {companyName}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-300">Practical destination information, seasonal tips and trip-planning advice published by your travel company.</p></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><h2 className="text-2xl font-black">Latest guides</h2>{listQuery.isLoading ? <p className="mt-6" aria-live="polite">Loading published guides…</p> : listQuery.isError ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5" role="alert"><p>Travel guides are temporarily unavailable.</p><button type="button" className="mt-3 font-bold underline" onClick={() => listQuery.refetch()}>Try again</button></div> : !listQuery.data.length ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><BookOpen className="mx-auto text-slate-400" size={30}/><p className="mt-3 font-bold">No guides have been published yet.</p><p className="mt-1 text-sm text-slate-500">Please check back for destination tips and travel advice.</p></div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listQuery.data.map(guide => <article key={guide._id || guide.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">{guide.coverImage && <img src={guide.coverImage} alt={guide.title} className="h-48 w-full object-cover" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }}/>}<div className="p-5"><p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">{guide.category || "Travel tips"}</p><h2 className="mt-2 text-xl font-black">{guide.title}</h2>{guide.excerpt && <p className="mt-2 line-clamp-3 leading-6 text-slate-600">{guide.excerpt}</p>}{guide.publishedAt && <p className="mt-3 text-xs text-slate-500">{dateLabel(guide.publishedAt, settingsLocale, timeZone)}</p>}<Link to={`/travel-guides/${encodeURIComponent(guide.slug)}`} className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-800 hover:text-emerald-950">Read guide <ArrowRight size={16}/></Link></div></article>)}</div>}</section></main>;
}
