import { lazy, Suspense } from "react";
import SEO from "../components/seo/SEO";
import HeroSlider from "../components/home/HeroSlider";
import HomeSearch from "../components/home/HomeSearch";
import { useSettings } from "../context/SettingsContext";

const StatsSection = lazy(() => import("../components/home/StatsSection"));
const FeaturedTours = lazy(() => import("../components/home/FeaturedTours"));
const DestinationsSection = lazy(() => import("../components/home/DestinationsSection"));
const CategoriesSection = lazy(() => import("../components/home/CategoriesSection"));
const TestimonialsSection = lazy(() => import("../components/home/TestimonialsSection"));
const GallerySection = lazy(() => import("../components/home/GallerySection"));
const WhyChooseUs = lazy(() => import("../components/home/WhyChooseUs"));
const MpesaCTA = lazy(() => import("../components/home/MpesaCTA"));
const NewsletterSection = lazy(() => import("../components/home/NewsletterSection"));

const DEFAULT_SECTIONS = { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true };
const SectionFallback = () => <div className="min-h-24" aria-hidden="true" />;

export default function Home() {
  const { companyName = "", settings = {} } = useSettings();
  const sections = { ...DEFAULT_SECTIONS, ...(settings.homepageSections || {}) };
  const seoTitle = settings.seoTitle || (companyName ? `Kenya Safaris & Tours | ${companyName}` : "Kenya Safaris & Tours");
  const seoDescription = settings.seoDescription || (companyName ? `Discover Kenya with ${companyName}: safaris, wildlife adventures, beach holidays and tailor-made African travel experiences.` : "Discover Kenya through safaris, wildlife adventures, beach holidays and tailor-made African travel experiences.");

  return (
    <main className="overflow-hidden bg-slate-950 text-slate-100" style={{ fontFamily: "var(--tenant-font-family,Inter), sans-serif" }}>
      <SEO title={seoTitle} description={seoDescription} image={settings.companyLogo || "/hero1.jpeg"} />
      <div className="relative">
        <HeroSlider />
        <HomeSearch />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute left-1/4 top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-[45rem] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <Suspense fallback={<SectionFallback />}>
          {sections.stats && <section className="py-12 md:py-16"><StatsSection /></section>}
          {sections.tours && <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-4 py-12 shadow-2xl backdrop-blur-sm sm:px-7 md:py-16"><FeaturedTours /></section>}
          {sections.destinations && <section className="py-12 md:py-16"><DestinationsSection /></section>}
          {sections.experiences && <section className="py-12 md:py-16"><CategoriesSection /></section>}
          {sections.services && <section className="py-12 md:py-16"><div className="mb-10 text-center"><p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">{companyName ? `${companyName} platform` : "Your travel platform"}</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Everything for your next journey</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">{companyName ? `${companyName} brings discovery, booking and travel support together in one modern experience.` : "Discover, plan and book unforgettable African experiences in one modern travel platform."}</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[["Luxury Safaris","Private and premium safari experiences across Kenya and East Africa."],["Wildlife Tours","Guided wildlife adventures in Kenya's iconic national parks and reserves."],["Beach Holidays","Relaxing coastal escapes, island stays and tailor-made beach packages."],["Group Adventures","Flexible group travel for families, friends, schools and organizations."],["Honeymoon Packages","Romantic itineraries designed around memorable stays and experiences."],["Airport Transfers","Reliable airport pickups and drop-offs coordinated around your itinerary."]].map(([title,description])=><article key={title} className="group rounded-3xl border border-white/10 bg-white/[0.05] p-7 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.08]"><div className="mb-5 h-1 w-12 rounded-full bg-emerald-400 transition-all group-hover:w-20"/><h3 className="text-xl font-bold text-white">{title}</h3><p className="mt-3 leading-7 text-slate-400">{description}</p></article>)}</div></section>}
          {sections.testimonials && <section className="py-12 md:py-16"><TestimonialsSection /></section>}
          {sections.gallery && <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-4 py-12 sm:px-7 md:py-16"><GallerySection /></section>}
          {sections.whyChooseUs && <section className="py-12 md:py-16"><WhyChooseUs /></section>}
        </Suspense>
      </div>
      <Suspense fallback={<SectionFallback />}>
        <section className="mt-8 bg-gradient-to-r from-emerald-950 via-emerald-800 to-cyan-900"><MpesaCTA /></section>
        {sections.newsletter && <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 md:px-8 lg:px-12"><NewsletterSection /></section>}
      </Suspense>
    </main>
  );
}
