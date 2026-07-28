import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/effect-fade";

const videos = [
  "/videos/city1.mp4",
  "/videos/city2.mp4",
  "/videos/city3.mp4",
  "/videos/city4.mp4",
];

export default function HeroSlider() {
  return (
    <section className="relative h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop
        className="h-full"
      >
        {videos.map((video, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-screen">
              {/* Background Video */}
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src={video}
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/55" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
                <span className="uppercase tracking-[6px] text-sm md:text-base mb-4 text-green-400">
                  Discover Africa
                </span>

                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                  Explore Luxury
                  <br />
                  Destinations
                </h1>

                <p className="mt-6 max-w-2xl text-lg md:text-2xl text-gray-200">
                  Experience breathtaking safaris, vibrant city celebrations,
                  stunning skylines, and unforgettable holiday adventures.
                </p>

                <div className="flex gap-4 mt-10 flex-wrap justify-center">
                  <Link
                    to="/tours"
                    className="bg-green-600 hover:bg-green-700 transition px-8 py-4 rounded-full font-semibold"
                  >
                    Explore Tours
                  </Link>

                  <Link
                    to="/contact"
                    className="border border-white hover:bg-white hover:text-black transition px-8 py-4 rounded-full font-semibold"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
