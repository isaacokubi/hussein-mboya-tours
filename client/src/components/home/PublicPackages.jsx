import LazyImage from "../common/LazyImage";
import { useQuery } from "@tanstack/react-query";
import { getPublicPackages } from "../../api/publicPackageApi";
import { Link } from "react-router-dom";
import { useTenant } from "../../context/TenantContext";
import { useSettings } from "../../context/SettingsContext";
import { ArrowRight } from "lucide-react";

const packagePrice = (item) => {
  const base = Number(item?.basePrice);
  const discounted = Number(item?.discountPrice);
  const value = Number.isFinite(discounted) && discounted > 0 ? discounted : base;
  if (item?.basePrice == null && !(Number.isFinite(discounted) && discounted > 0)) return "Price on request";
  if (!Number.isFinite(value) || value < 0) return "Price on request";
  return (item.currency || "KES") + " " + value.toLocaleString("en-KE", { maximumFractionDigits: 0 });
};

export default function PublicPackages() {
  const { tenant = {} } = useTenant() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["public-tenant-packages", tenantKey],
    queryFn: getPublicPackages,
    staleTime: 60_000,
  });

  if (!isLoading && data.length === 0 && !isError) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="tenant-packages-heading">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f0d38b]">Curated for you</p>
        <h2 id="tenant-packages-heading" className="mt-2 text-3xl font-black text-white">Travel packages</h2>
      </div>
      {isLoading ? <p className="text-center text-slate-300">Loading packages…</p> : isError ? (
        <div className="mx-auto max-w-xl text-center text-amber-100" role="alert"><p>We are refreshing our travel packages.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-[#e3bd67] px-4 py-2 font-bold text-slate-950 hover:bg-[#f0d38b]">Try Again</button></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <article key={item._id} className="overflow-hidden rounded-2xl border border-white/10 bg-white text-[#17231e] shadow-lg">
              <div className="h-48 w-full overflow-hidden"><LazyImage src={item.coverImage?.url || item.coverImage} alt={item.title || "Kenya travel package"} className="h-full w-full object-cover" /></div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8a6423]">{item.category} · {item.destination}</p>
                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.shortDescription || item.description}</p>
                <div className="mt-4 flex items-end justify-between gap-3"><p className="font-bold text-[#8a6423]">{packagePrice(item)}</p><Link to="/tours" className="inline-flex items-center gap-1 text-sm font-extrabold text-[#12372a]">Explore <ArrowRight size={14}/></Link></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
