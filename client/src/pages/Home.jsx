import SEO from "../components/seo/SEO";
import HeroSlider from "../components/home/HeroSlider";
import StatsSection from "../components/home/StatsSection";
import FeaturedTours from "../components/home/FeaturedTours";
import DestinationsSection from "../components/home/DestinationsSection";
import CategoriesSection from "../components/home/CategoriesSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import GallerySection from "../components/home/GallerySection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import MpesaCTA from "../components/home/MpesaCTA";
import NewsletterSection from "../components/home/NewsletterSection";
import { useSettings } from "../context/SettingsContext";

const DEFAULT_SECTIONS = { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true };

export default function Home() {
  const { companyName = "", settings = {} } = useSettings();
  const sections = { ...DEFAULT_SECTIONS, ...(settings.homepageSections || {}) };
  return <main className="overflow-hidden bg-[var(--tenant-background,#f8fafc)]" style={{ color: "var(--tenant-text,#0f172a)", fontFamily: "var(--tenant-font-family,Inter), sans-serif" }}>
    <SEO title={companyName ? `Kenya Safaris & Tours | ${companyName}` : "Kenya Safaris & Tours"} description={companyName ? `Discover Kenya with ${companyName}: safaris, wildlife adventures, beach holidays and tailor-made African travel experiences.` : "Discover Kenya through safaris, wildlife adventures, beach holidays and tailor-made African travel experiences."} image="/hero1.jpeg" />
    <section><HeroSlider /></section>
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      {sections.stats && <section className="py-12 md:py-16"><StatsSection /></section>}
      {sections.tours && <section className="py-12 md:py-16"><FeaturedTours /></section>}
      {sections.destinations && <section className="py-12 md:py-16"><DestinationsSection /></section>}
      {sections.experiences && <section className="py-12 md:py-16"><CategoriesSection /></section>}
      {sections.services && <section className="py-12 md:py-16"><div className="mb-8 text-center"><p className="text-sm font-bold uppercase tracking-[0.2em]" style={{color:"var(--tenant-primary,#047857)"}}>What we offer</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Travel Services</h2><p className="mx-auto mt-3 max-w-2xl opacity-70">{companyName ? `From safari planning to airport pickup, ${companyName} handles the important details of your African journey.` : "From safari planning to airport pickup, we handle the important details of your African journey."}</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[["Luxury Safaris","Private and premium safari experiences across Kenya and East Africa."],["Wildlife Tours","Guided wildlife adventures in Kenya's iconic national parks and reserves."],["Beach Holidays","Relaxing coastal escapes, island stays and tailor-made beach packages."],["Group Adventures","Flexible group travel for families, friends, schools and organizations."],["Honeymoon Packages","Romantic itineraries designed around memorable stays and experiences."],["Airport Transfers","Reliable airport pickups and drop-offs coordinated around your itinerary."]].map(([title,description])=><article key={title} className="rounded-2xl bg-[var(--tenant-surface,#fff)] p-6 shadow-sm ring-1 ring-black/5"><h3 className="text-xl font-bold" style={{color:"var(--tenant-secondary,#064e3b)"}}>{title}</h3><p className="mt-2 opacity-70">{description}</p></article>)}</div></section>}
      {sections.testimonials && <section className="py-12 md:py-16"><TestimonialsSection /></section>}
      {sections.gallery && <section className="py-12 md:py-16"><GallerySection /></section>}
      {sections.whyChooseUs && <section className="py-12 md:py-16"><WhyChooseUs /></section>}
    </div>
    <section className="mt-8" style={{background:`linear-gradient(90deg,var(--tenant-secondary,#064e3b),var(--tenant-primary,#047857),var(--tenant-accent,#10b981))`}}><MpesaCTA /></section>
    {sections.newsletter && <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 md:px-8 lg:px-12"><NewsletterSection /></section>}
  </main>;
}
