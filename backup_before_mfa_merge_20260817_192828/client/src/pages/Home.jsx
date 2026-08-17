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


export default function Home(
) {
  const { companyName } = useSettings();

  return (
    <main
      className="
        overflow-hidden
        bg-gray-50
      "
    >

      <SEO
        title={`Luxury Kenya Safaris | ${companyName}`}
        description="Experience luxury safaris, beach holidays and unforgettable African adventures across Kenya."
        image="/hero1.jpeg"
      />


      {/* Hero stays wider for cinematic effect */}
      <section>
        <HeroSlider />
      </section>



      {/* Main page content container */}
      <div
        className="
          max-w-[1600px]
          mx-auto
          px-4
          sm:px-6
          md:px-8
          lg:px-12
          xl:px-16
        "
      >


        <section className="py-12 md:py-16">
          <StatsSection />
        </section>



        <section className="py-12 md:py-16">
          <FeaturedTours />
        </section>



        <section className="py-12 md:py-16">
          <DestinationsSection />
        </section>



        <section className="py-12 md:py-16">
          <CategoriesSection />
        </section>

        <section className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">What we offer</p>
            <h2 className="mt-2 text-3xl font-extrabold text-green-950 md:text-4xl">Travel Services</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">From safari planning to airport pickup, {companyName} handles the important details of your African journey.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Luxury Safaris", "Private and premium safari experiences across Kenya and East Africa."],
              ["Wildlife Tours", "Guided wildlife adventures in Kenya's iconic national parks and reserves."],
              ["Beach Holidays", "Relaxing coastal escapes, island stays and tailor-made beach packages."],
              ["Group Adventures", "Flexible group travel for families, friends, schools and organizations."],
              ["Honeymoon Packages", "Romantic itineraries designed around memorable stays and experiences."],
              ["Airport Transfers", "Reliable airport pickups and drop-offs coordinated around your itinerary."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-bold text-green-900">{title}</h3>
                <p className="mt-2 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>



        <section className="py-12 md:py-16">
          <TestimonialsSection />
        </section>



        <section className="py-12 md:py-16">
          <GallerySection />
        </section>



        <section className="py-12 md:py-16">
          <WhyChooseUs />
        </section>


      </div>



      {/* Full width premium CTA sections */}
      <section
        className="
          mt-8
          bg-gradient-to-r
          from-green-900
          via-green-800
          to-emerald-700
        "
      >
        <MpesaCTA />
      </section>



      <section
        className="
          px-4
          sm:px-6
          md:px-8
          lg:px-12
          py-12
          max-w-[1600px]
          mx-auto
        "
      >
        <NewsletterSection />
      </section>


    </main>
  );
}