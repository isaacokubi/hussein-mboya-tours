/**
 * Purpose: Newsletter Section reusable UI component. Main declarations: NewsletterSection.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load ../../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../../context/TenantContext";

// Define NewsletterSection; its parameters and body implement this operation.
export default function NewsletterSection() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant() || {};
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Hussein Mboya Tours";

  // Return the expression shown below to the caller.
  return (
    <section className="py-16 bg-slate-900 text-slate-100" aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-6 text-center">
        <h2 id="newsletter-heading" className="text-3xl font-bold text-white">
          Subscribe To {companyName} Updates
        </h2>

        <p className="mt-4 text-slate-300">
          Get safari offers, travel inspiration, destination guides and new experiences.
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
