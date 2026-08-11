import { useCallback, useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  EffectFade,
} from "swiper/modules";

import { Link } from "react-router-dom";

import { getHeroSlides } from "../../api/heroApi";

import "swiper/css";
import "swiper/css/effect-fade";


export default function HeroSlider() {
  const videoRefs = useRef([]);
  const loadedVideos = useRef(new Set());
  const [activeIndex, setActiveIndex] = useState(0);


  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["heroSlides"],
    queryFn: getHeroSlides,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });


  const loadAndPlayVideo = useCallback((index) => {
    const video = videoRefs.current[index];

    if (!video) {
      return;
    }

    const videoUrl = video.dataset.src;

    if (!videoUrl) {
      return;
    }

    if (!video.src) {
      video.src = videoUrl;
      loadedVideos.current.add(index);

      video.load();
    }

    video.play().catch(() => {});
  }, []);


  const pauseAllVideos = useCallback(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
      }
    });
  }, []);


  useEffect(() => {
    if (!slides.length) {
      return;
    }

    const timer = setTimeout(() => {
      loadAndPlayVideo(activeIndex);
    }, 150);

    return () => clearTimeout(timer);
  }, [activeIndex, slides.length, loadAndPlayVideo]);


  if (isLoading) {
    return (
      <section
        className="
          h-[85vh]
          flex
          items-center
          justify-center
          bg-gray-900
          text-white
        "
      >
        Loading...
      </section>
    );
  }


  if (isError || !slides.length) {
    return (
      <section
        className="
          h-[85vh]
          flex
          items-center
          justify-center
          bg-gray-900
          text-white
        "
      >
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
          rounded-xl
          overflow-hidden
          shadow-2xl
          bg-black
        "
      >

        <Swiper
          modules={[
            Autoplay,
            EffectFade,
          ]}

          effect="fade"

          speed={900}

          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}

          loop={slides.length > 1}

          preloadImages={false}

          lazy={{
            loadPrevNext: false,
            loadOnTransitionStart: false,
          }}

          className="h-full"

          onSwiper={(swiper) => {
            setActiveIndex(swiper.realIndex || 0);
          }}

          onSlideChange={(swiper) => {
            const nextIndex = swiper.realIndex;

            pauseAllVideos();

            setActiveIndex(nextIndex);
          }}
        >

          {slides.map((slide, index) => {
            const imageUrl =
              slide.image?.url ||
              slide.image ||
              "/hero1.jpeg";

            const videoUrl =
              slide.video?.url ||
              slide.video ||
              null;

            return (
              <SwiperSlide key={slide._id || index}>

                <div
                  className="
                    relative
                    h-full
                    overflow-hidden
                    bg-black
                  "
                >

                  {/* Hero image is always available immediately */}
                  <img
                    src={imageUrl}
                    alt={slide.title || "Kenya safari"}
                    fetchPriority={
                      index === 0
                        ? "high"
                        : "low"
                    }
                    loading={
                      index === 0
                        ? "eager"
                        : "lazy"
                    }
                    decoding="async"
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />


                  {/* Video source is deliberately NOT loaded
                      until this slide becomes active */}
                  {videoUrl && (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}

                      data-src={videoUrl}

                      poster={imageUrl}

                      muted

                      playsInline

                      loop

                      preload="none"

                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  )}


                  {/* Dark cinematic overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-b
                      from-black/40
                      via-black/50
                      to-black/80
                      z-[1]
                    "
                  />


                  {/* Hero content */}
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
                          text-sm
                          font-semibold
                        "
                      >
                        {slide.badge}
                      </span>
                    )}


                    {slide.title && (
                      <h1
                        className="
                          max-w-5xl
                          text-4xl
                          sm:text-5xl
                          md:text-6xl
                          lg:text-7xl
                          font-bold
                          leading-tight
                          drop-shadow-2xl
                        "
                      >
                        {slide.title}
                      </h1>
                    )}


                    {slide.description && (
                      <p
                        className="
                          mt-5
                          max-w-3xl
                          text-base
                          sm:text-lg
                          md:text-xl
                          text-white/90
                          drop-shadow-lg
                        "
                      >
                        {slide.description}
                      </p>
                    )}


                    {slide.buttonText && slide.buttonLink && (
                      <Link
                        to={slide.buttonLink}
                        className="
                          mt-8
                          inline-flex
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          px-7
                          py-3
                          font-semibold
                          text-gray-900
                          shadow-xl
                          transition
                          hover:scale-105
                        "
                      >
                        {slide.buttonText}
                      </Link>
                    )}

                  </div>

                </div>

              </SwiperSlide>
            );
          })}

        </Swiper>

      </div>

    </section>
  );
}