import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function WhyChooseUs() {
  const { tenant = {} } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Travel company";
  const hasSupportContact = Boolean(settings.supportPhone || settings.supportEmail || tenant.contactPhone || tenant.contactEmail);

  const items = [
    { title: "Clear trip details", text: "Review the published itinerary, departure information, price, inclusions and exclusions before you book." },
    { title: "Flexible planning", text: "Explore published trips or contact the travel team to discuss a custom itinerary." },
    { title: "Booking transparency", text: "Review the final booking summary and wait for server-confirmed payment status before treating a booking as paid." },
    ...(hasSupportContact ? [{ title: "Tenant support contact", text: "Use the contact details published by " + companyName + " to ask about availability, changes or trip requirements." }] : []),
  ];

  return (
    <section className="py-16 text-slate-100" aria-labelledby="why-choose-us-heading">
      <div className="container mx-auto px-6">
        <h2 id="why-choose-us-heading" className="text-center text-3xl font-black text-white">Why travel with {companyName}?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
