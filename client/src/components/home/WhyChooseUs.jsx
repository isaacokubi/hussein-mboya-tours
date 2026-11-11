/**
 * Purpose: Why Choose Us reusable UI component. Main declarations: WhyChooseUs.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load ../../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../../context/TenantContext";

// Define WhyChooseUs; its parameters and body implement this operation.
export default function WhyChooseUs() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant() || {};
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Hussein Mboya Tours";

  // Declare items for use by the surrounding module or function.
  const items = [
    { title: "Expert Local Guides", text: `${companyName} provides experienced guides for authentic Kenyan experiences.` },
    { title: "Safe Travel", text: "Your safety and comfort are our highest priority." },
    { title: "24/7 Support", text: "We are available throughout your journey." },
    { title: "Premium Experience", text: "Luxury accommodation and personalized travel experiences." },
  ];

  // Return the expression shown below to the caller.
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
