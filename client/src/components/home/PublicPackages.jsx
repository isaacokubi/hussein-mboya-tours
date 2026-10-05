import { useQuery } from "@tanstack/react-query";
import { getPublicPackages } from "../../api/publicPackageApi";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PublicPackages() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["public-tenant-packages"],
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
        <p className="text-center text-amber-200" role="status">Packages are temporarily unavailable. Please try again later.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <article key={item._id} className="overflow-hidden rounded-2xl border border-white/10 bg-white text-[#17231e] shadow-lg">
              {item.coverImage?.url && <img src={item.coverImage.url} alt="" className="h-48 w-full object-cover" loading="lazy" />}
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8a6423]">{item.category} · {item.destination}</p>
                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.shortDescription || item.description}</p>
                <div className="mt-4 flex items-end justify-between gap-3"><p className="font-bold text-[#8a6423]">{item.currency || "KES"} {Number(item.discountPrice ?? item.basePrice ?? 0).toLocaleString()}</p><Link to="/tours" className="inline-flex items-center gap-1 text-sm font-extrabold text-[#12372a]">Explore <ArrowRight size={14}/></Link></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
