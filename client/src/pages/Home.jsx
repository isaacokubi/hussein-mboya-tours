import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarCheck2, CarFront, Compass, CreditCard, Headphones, Hotel, MapPinned, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import SEO from "../components/seo/SEO";
import HeroSlider from "../components/home/HeroSlider";
import HomeSearch from "../components/home/HomeSearch";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";

const StatsSection = lazy(() => import("../components/home/StatsSection"));
const FeaturedTours = lazy(() => import("../components/home/FeaturedTours"));
const PublicPackages = lazy(() => import("../components/home/PublicPackages"));
const DestinationsSection = lazy(() => import("../components/home/DestinationsSection"));
const CategoriesSection = lazy(() => import("../components/home/CategoriesSection"));
const TestimonialsSection = lazy(() => import("../components/home/TestimonialsSection"));
const GallerySection = lazy(() => import("../components/home/GallerySection"));
const WhyChooseUs = lazy(() => import("../components/home/WhyChooseUs"));
const MpesaCTA = lazy(() => import("../components/home/MpesaCTA"));
const NewsletterSection = lazy(() => import("../components/home/NewsletterSection"));

const DEFAULT_SECTIONS = { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true };
const SectionFallback = () => <div className="min-h-24" aria-hidden="true" />;

const JOURNEY = [
  ["Discover", "Browse curated tours, destinations and travel services.", Compass],
  ["Enquire", "Request a quote or tailor an itinerary around your needs.", UsersRound],
  ["Book", "Accept your quotation and confirm the trip online.", CalendarCheck2],
  ["Pay", "Pay securely with M-Pesa and supported payment methods.", CreditCard],
  ["Travel", "Get coordinated guides, drivers, hotels and transfers.", CarFront],
  ["Remember", "Complete your journey, share feedback and stay connected.", BadgeCheck],
];

const SERVICES = [
  ["Safaris & Tours", "Curated and tailor-made Kenya adventures.", Compass, "/tours"],
  ["Hotels & Stays", "Accommodation coordinated around your itinerary.", Hotel, "/hotels"],
  ["Airport Transfers", "Reliable pickups and drop-offs from arrival to departure.", CarFront, "/airport-transfers"],
  ["Custom Travel", "Flexible experiences for families, groups, corporates and honeymoons.", Sparkles, "/tours"],
];

export default function Home() {
  const { tenant = {} } = useTenant() || {};
  const { companyName: configuredCompanyName = "", settings = {} } = useSettings() || {};
  const companyName = configuredCompanyName || tenant.name || tenant.companyName || "Hussein Mboya Tours";
  const sections = { ...DEFAULT_SECTIONS, ...(settings.homepageSections || {}) };
  const seoTitle = settings.seoTitle || `Kenya Safaris & Tours | ${companyName}`;
  const seoDescription = settings.seoDescription || `Discover Kenya with ${companyName}: safaris, wildlife, beach holidays, custom itineraries and seamless travel support.`;

  return (
    <main className="overflow-hidden bg-[#fbf7ef] text-[#17231e]" style={{ fontFamily: "var(--tenant-font-family,Inter), sans-serif" }}>
      <SEO title={seoTitle} description={seoDescription} image={settings.companyLogo || tenant.logoUrl || "/hero1.jpeg"} />

      <section className="relative bg-[#0b241b] ">
        <HeroSlider />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#071a13]/85 to-transparent" />
        <HomeSearch />
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
          {JOURNEY.map(([title, text, Icon]) => (
            <div key={title} className="bg-white px-5 py-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#8a6423]"><Icon size={19} /></span>
                <h3 className="font-bold text-slate-900">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <Suspense fallback={<SectionFallback />}>
          {sections.stats && <section className="py-10 md:py-14"><StatsSection /></section>}

          {sections.tours && (
            <section className="rounded-[2rem] bg-[#0b241b] px-4 py-10 shadow-2xl sm:px-8 md:py-14">
              <FeaturedTours />
            </section>
          )}

          {sections.packages !== false && <section className="my-12 rounded-[2rem] bg-[#102d23] px-4 py-10 shadow-2xl sm:px-8 md:py-14"><PublicPackages /></section>}

          {sections.destinations && <section className="py-12 md:py-16"><DestinationsSection /></section>}

          {sections.experiences && (
            <section className="my-12 overflow-hidden rounded-[2rem] !bg-black p-0 text-black shadow-2xl" style={{ backgroundColor: "#000000", color: "#000000" }} data-home-section="traveller-experiences">
              <CategoriesSection />
            </section>
          )}

          {sections.services && (
            <section className="rounded-[2rem] bg-[#0b241b]  px-6 py-14 text-white shadow-xl sm:px-10 md:py-16">
              <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[#e3bd67]">One travel platform</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything behind a seamless Kenya journey.</h2>
                  <p className="mt-5 max-w-xl leading-7 text-emerald-50/75">
                    {companyName} connects discovery, enquiries, quotations, bookings, payments and trip operations in one experience—so travelers get simplicity and your team gets control.
                  </p>
                  <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-950 transition hover:-translate-y-0.5 hover:shadow-lg">
                    Plan with a travel expert <ArrowRight size={17} />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SERVICES.map(([title, text, Icon, path]) => (
                    <Link key={title} to={path} className="group rounded-2xl border border-[#d8bd7a]/25 bg-white/[.07] p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[.11]">
                      <Icon className="text-[#e3bd67]" size={23} />
                      <h3 className="mt-4 font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-emerald-50/65">{text}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#e3bd67]">Explore <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {sections.testimonials && <section className="py-12 md:py-16"><TestimonialsSection /></section>}
          {sections.gallery && <section className="rounded-[2rem] bg-white px-4 py-8 shadow-sm ring-1 ring-slate-200 sm:px-8 md:py-12"><GallerySection /></section>}
          {sections.whyChooseUs && <section className="my-12 rounded-[2rem] bg-[#102d23] px-4 py-10 shadow-2xl sm:px-8 md:py-14"><WhyChooseUs /></section>}
        </Suspense>
      </div>

      <Suspense fallback={<SectionFallback />}>
        <section className="mt-8"><MpesaCTA /></section>
        {sections.newsletter && <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><NewsletterSection /></section>}
      </Suspense>
    </main>
  );
}