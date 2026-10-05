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
    <section
      className="hmt-testimonials my-12 overflow-hidden rounded-[2rem] !bg-black px-5 py-14 text-black shadow-2xl sm:px-8 md:py-20"
      style={{ backgroundColor: "#000000", color: "#000000" }}
      aria-labelledby="traveler-experiences-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="traveler-experiences-heading" className="text-center text-3xl font-black text-black sm:text-4xl">Traveler Experiences</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-black !bg-black p-6 shadow-xl transition hover:-translate-y-1"
              style={{ backgroundColor: "#000000" }}
            >
              <h3 className="text-lg font-bold text-black">{testimonial.name}</h3>
              <p className="mt-1 text-sm font-medium text-black">{testimonial.country}</p>
              <p className="mt-4 leading-7 text-black">“{testimonial.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}