import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function NewsletterSection() {
  const { tenant = {} } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Travel company";
  const supportEmail = String(settings?.supportEmail || tenant?.contactEmail || "").trim();

  // There is no newsletter subscription endpoint or consent record in this application yet.
  // Do not collect an email address in an inert form or imply that it was subscribed.
  return (
    <section className="bg-slate-900 py-16 text-slate-100" aria-labelledby="newsletter-heading">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-300">Plan your next journey</p>
          <h2 id="newsletter-heading" className="mt-3 text-3xl font-black text-white">Stay in touch with {companyName}</h2>
          <p className="mt-3 leading-7 text-slate-300">Ask about new trips, seasonal travel advice and tailor-made itineraries. We will use the support contact published for this travel company.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          {supportEmail && <a href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Travel updates from ${companyName}`)}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-bold text-white transition hover:bg-white/10"><Mail size={18} aria-hidden="true" /> Email the team</a>}
          <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-emerald-400">Contact us <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
