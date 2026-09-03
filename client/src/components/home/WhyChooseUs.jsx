import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function WhyChooseUs() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Your Travel Company";

  const items = [
    { title: "Expert Local Guides", text: `${companyName} provides experienced guides for authentic Kenyan experiences.` },
    { title: "Safe Travel", text: "Your safety and comfort are our highest priority." },
    { title: "24/7 Support", text: "We are available throughout your journey." },
    { title: "Premium Experience", text: "Luxury accommodation and personalized travel experiences." },
  ];

  return (
    <section className="py-16 text-slate-100" aria-labelledby="why-choose-us-heading">
      <div className="container mx-auto px-6">
        <h2 id="why-choose-us-heading" className="text-center text-3xl font-black text-white">Why Choose {companyName}?</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {items.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-lg text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
