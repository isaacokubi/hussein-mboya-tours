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
    <>
      <SEO
        title="Luxury Kenya Safaris | Hussein Mboya Tours"
        description="Experience luxury safaris, beach holidays and unforgettable African adventures."
        image="/hero1.jpeg"
      />

      <HeroSlider />

      <StatsSection />

      <FeaturedTours />

      <DestinationsSection />

      <CategoriesSection />

      <TestimonialsSection />

      <GallerySection />

      <WhyChooseUs />

      <MpesaCTA />

      <NewsletterSection />
    </>
  );
}