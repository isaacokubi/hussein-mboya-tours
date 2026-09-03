import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function NewsletterSection() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Your Travel Company";

  return (
    <section className="py-16 bg-slate-900 text-slate-100" aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-6 text-center">
        <h2 id="newsletter-heading" className="text-3xl font-bold text-white">
          Subscribe To {companyName} Updates
        </h2>

        <p className="mt-4 text-slate-300">
          Get exclusive safari offers, travel tips and new experiences.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 max-w-xl mx-auto">
          <input
            type="email"
            className="flex-1 border border-white/20 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Email address"
            aria-label="Email address"
          />

          <button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
