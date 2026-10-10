import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function TestimonialsSection() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "our team";
  const configured = Array.isArray(settings?.testimonials) ? settings.testimonials : [];
  // Public social proof must come from explicitly approved, tenant-managed reviews.
  const testimonials = configured
    .filter((item) => item && item.approved === true && String(item.text || "").trim() && String(item.name || "").trim())
    .slice(0, 6);

  if (!testimonials.length) return null;

  return (
    <section
      className="hmt-testimonials my-12 overflow-hidden rounded-[2rem] bg-[#12372a] px-5 py-14 text-white shadow-2xl sm:px-8 md:py-20"
      aria-labelledby="traveler-experiences-heading"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-extrabold uppercase tracking-[.2em] text-emerald-300">{companyName}</p>
        <h2 id="traveler-experiences-heading" className="mt-3 text-center text-3xl font-black text-white sm:text-4xl">Guest experiences</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial._id || testimonial.id || `${testimonial.name}-${index}`}
              className="rounded-2xl border border-white/10 bg-[#0b241b] p-6 shadow-xl transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
              {testimonial.country && <p className="mt-1 text-sm font-medium text-emerald-300">{testimonial.country}</p>}
              <p className="mt-4 leading-7 text-emerald-50/90">“{testimonial.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
