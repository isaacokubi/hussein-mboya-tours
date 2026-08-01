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


export default function Home() {
  return (
    <main
      className="
        overflow-hidden
        bg-gray-50
      "
    >

      <SEO
        title="Luxury Kenya Safaris | Hussein Mboya Tours"
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