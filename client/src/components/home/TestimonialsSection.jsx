import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function TestimonialsSection() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Your Travel Company";

  const testimonials = [
    { name: "Sarah Williams", country: "United Kingdom", text: `${companyName} gave us the best safari experience in Kenya.` },
    { name: "James Anderson", country: "United States", text: "Professional guides and unforgettable adventures." },
    { name: "Amina Hassan", country: "United Arab Emirates", text: "Amazing holiday packages and excellent service." },
  ];

  return (
    <section className="py-16 text-slate-100" aria-labelledby="traveler-experiences-heading">
      <div className="container mx-auto px-6">
        <h2 id="traveler-experiences-heading" className="text-3xl font-black text-center text-white">Traveler Experiences</h2>
        <div className="grid gap-6 mt-10 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-lg text-white">{testimonial.name}</h3>
              <p className="mt-1 text-sm font-medium text-emerald-300">{testimonial.country}</p>
              <p className="mt-4 leading-7 text-slate-300">“{testimonial.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
