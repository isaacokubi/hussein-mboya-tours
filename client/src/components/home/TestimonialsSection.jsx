import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function TestimonialsSection() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Hussein Mboya Tours";

  const testimonials = [
    { name: "Sarah Williams", country: "United Kingdom", text: `${companyName} gave us the best safari experience in Kenya.` },
    { name: "James Anderson", country: "United States", text: "Professional guides and unforgettable adventures." },
    { name: "Amina Hassan", country: "United Arab Emirates", text: "Amazing holiday packages and excellent service." },
  ];

  return (
    <section
      className="hmt-testimonials my-12 overflow-hidden rounded-[2rem] !bg-[#12372a] px-5 py-14 text-white shadow-2xl sm:px-8 md:py-20"
      style={{ backgroundColor: "#12372a", color: "#ffffff" }}
      aria-labelledby="traveler-experiences-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="traveler-experiences-heading" className="text-center text-3xl font-black text-white sm:text-4xl">Traveler Experiences</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-white/10 !bg-[#0b241b] p-6 shadow-xl transition hover:-translate-y-1 hover:!bg-[#173f31]"
              style={{ backgroundColor: "#0b241b" }}
            >
              <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
              <p className="mt-1 text-sm font-medium text-emerald-300">{testimonial.country}</p>
              <p className="mt-4 leading-7 text-emerald-50/80">“{testimonial.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}