import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { getPublicTestimonials } from "../../api/reviewApi";
import { useTenant } from "../../context/TenantContext";
import { useSettings } from "../../context/SettingsContext";

export default function TestimonialsSection() {
  const { tenant = {} } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Travel company";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-testimonials", tenantKey],
    queryFn: getPublicTestimonials,
    staleTime: 60000,
    retry: 1,
  });
  const testimonials = (Array.isArray(data?.testimonials) ? data.testimonials : [])
    .filter((item) => item && item.verified === true && item.publicConsent === true)
    .filter((item) => String(item.name || "").trim() && String(item.text || "").trim())
    .slice(0, 6);

  if (isLoading || isError || !testimonials.length) return null;

  return (
    <section className="hmt-testimonials my-12 overflow-hidden rounded-[2rem] bg-[#12372a] px-5 py-14 text-white shadow-2xl sm:px-8 md:py-20" aria-labelledby="traveler-experiences-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="traveler-experiences-heading" className="text-center text-3xl font-black text-white sm:text-4xl">Traveler Experiences with {companyName}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => {
            const stars = Math.max(0, Math.min(5, Number(testimonial.rating) || 0));
            return <article key={testimonial._id} className="rounded-2xl border border-white/10 bg-[#0b241b] p-6 shadow-xl">
              <div className="flex items-center gap-1 text-amber-300" aria-label={stars + " out of 5 stars"}>{Array.from({ length: stars }, (_, index) => <Star key={index} size={15} fill="currentColor" aria-hidden="true" />)}</div>
              <h3 className="mt-3 text-lg font-bold text-white">{testimonial.name}</h3>
              {testimonial.tourTitle && <p className="mt-1 text-sm font-medium text-emerald-300">Trip: {testimonial.tourTitle}</p>}
              <p className="mt-4 leading-7 text-emerald-50/90">“{testimonial.text}”</p>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
