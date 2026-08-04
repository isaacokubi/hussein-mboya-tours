import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";

import { getHeroSlides } from "../../api/heroApi";

import "swiper/css";
import "swiper/css/effect-fade";

export default function HeroSlider() {
  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["heroSlides"],
    queryFn: getHeroSlides,
  });

  if (isLoading) {
    return (
      <section className="h-[85vh] flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </section>
    );
  }

  if (isError || !slides.length) {
    return (
      <section className="h-[85vh] flex items-center justify-center bg-gray-900 text-white text-xl">
        No hero slides available
      </section>
    );
  }

  return (
    <section
      className="
        relative
        px-1
        
        
        py-1
        overflow-hidden
      "
    >
      <div
        className="
          relative
          h-[85vh]
          overflow-hidden
          rounded-xl
          shadow-2xl
        "
      >
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={slides.length > 3}
          className="h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide._id}>
              <div
                className="
                relative
                h-full
                overflow-hidden
              "
              >
                {slide.video?.url && (
                  <video
                    src={slide.video.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                    scale-105
                    animate-pulse
                  "
                  />
                )}

                {/* Premium Travel Overlay */}

                <div
                  className="
                  absolute
                  inset-0
                  bg-gradient-to-b
                  from-black/40
                  via-black/50
                  to-black/80
                "
                />

                <div
                  className="
                  relative
                  z-10
                  h-full
                  flex
                  flex-col
                  justify-center
                  items-center
                  text-center
                  px-6
                  text-white
                "
                >
                  {slide.badge && (
                    <span
                      className="
                    mb-5
                    px-5
                    py-2
                    rounded-full
                    bg-white/20
                    backdrop-blur-md
                    border
                    border-white/30
                    uppercase
                    tracking-[5px]
                    text-sm
                    text-green-300
                  "
                    >
                      {slide.badge}
                    </span>
                  )}

                  <h1
                    className="
                  text-4xl
                  sm:text-5xl
                  md:text-7xl
                  font-black
                  leading-tight
                  max-w-5xl
                  drop-shadow-lg
                "
                  >
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p
                      className="
                    mt-6
                    max-w-3xl
                    text-base
                    md:text-xl
                    text-gray-200
                    leading-relaxed
                  "
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  <div
                    className="
                  flex
                  gap-5
                  mt-10
                  flex-wrap
                  justify-center
                "
                  >
                    {slide.buttonOne?.text && (
                      <Link
                        to={slide.buttonOne.link || "#"}
                        className="
                    bg-green-600
                    hover:bg-green-700
                    px-9
                    py-4
                    rounded-full
                    font-bold
                    shadow-lg
                    hover:scale-105
                    transition
                  "
                      >
                        {slide.buttonOne.text}
                      </Link>
                    )}

                    {slide.buttonTwo?.text && (
                      <Link
                        to={slide.buttonTwo.link || "#"}
                        className="
                    bg-white/10
                    backdrop-blur-md
                    border
                    border-white/50
                    hover:bg-white
                    hover:text-black
                    px-9
                    py-4
                    rounded-full
                    font-bold
                    transition
                    hover:scale-105
                  "
                      >
                        {slide.buttonTwo.text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
