
import { useTenant } from '../../context/TenantContext';
import { useSettings } from "../../context/SettingsContext";
import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import { Link } from "react-router-dom";

import { getHeroSlides } from "../../api/heroApi";

import "swiper/css";
import "swiper/css/effect-fade";

export default function HeroSlider() {

  const { tenant } = useTenant() || {};

  const { settings = {} } = useSettings() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Your Travel Company";




  const videoRefs = useRef([]);
  const [heroReady, setHeroReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState({});

  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["heroSlides", settings?.companyName || "default"],
    queryFn: getHeroSlides,
    enabled: true,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Render the image first. Video loading starts only after the hero has painted.
  useEffect(() => {
    if (!slides.length) return;

    const timer = window.setTimeout(() => {
      setHeroReady(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [slides]);

  const markVideoLoaded = (index) => {
    setLoadedVideos((current) => ({
      ...current,
      [index]: true,
    }));
  };

  const playVideo = (index) => {
    const video = videoRefs.current[index];

    if (!video || !heroReady) return;

    video.play().catch(() => {});
  };

  const pauseAllVideos = () => {
    videoRefs.current.forEach((video) => {
      if (!video) return;
      video.pause();
    });
  };

  if (isLoading) {
    return (
      <section className="h-[85vh] flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-pulse text-lg">Loading...</div>
      </section>
    );
  }

  if (isError || !slides.length) {
    return (
      <section className="h-[85vh] flex items-center justify-center bg-gray-900 text-white">
        Homepage banners are not configured
      </section>
    );
  }

  return (
    <section className="relative px-1 py-1 overflow-hidden">
      <div className="relative h-[85vh] rounded-xl overflow-hidden shadow-2xl">
        <Swiper
          modules={[Autoplay, EffectFade]}
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
          }}
          className="h-full"
          onSwiper={(swiper) => {
            pauseAllVideos();
            window.setTimeout(() => {
              playVideo(swiper.realIndex);
            }, 100);
          }}
          onSlideChange={(swiper) => {
            pauseAllVideos();
            window.setTimeout(() => {
              playVideo(swiper.realIndex);
            }, 100);
          }}
        >
          {slides.map((slide, index) => {
            const imageUrl = slide.image?.url || slide.image || "/hero1.jpeg";
            const videoUrl = slide.video?.url || slide.video;
            const videoLoaded = Boolean(loadedVideos[index]);

            return (
              <SwiperSlide key={slide._id || index}>
                <div className="relative h-full overflow-hidden bg-gray-900">
                  {/*
                   * IMAGE PLACEHOLDER / POSTER:
                   * The image stays visible while the video is downloading,
                   * buffering or waiting for its first playable frame.
                   */}
                  <img
                    src={imageUrl}
                    alt={slide.title || settings?.companyName || settings?.companyName || tenant?.name || 'Your Travel Company'}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      videoLoaded ? "opacity-0" : "opacity-100"
                    }`}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />

                  {/*
                   * Video remains transparent until it has a playable frame.
                   * This prevents a black/blank hero during slow video loading.
                   */}
                  {videoUrl && heroReady && (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={videoUrl}
                      muted
                      playsInline
                      loop
                      preload={index === 0 ? "metadata" : "none"}
                      poster={imageUrl}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                        videoLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onCanPlay={() => {
                        markVideoLoaded(index);
                        if (index === 0) {
                          playVideo(index);
                        }
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 text-white">
                    {slide.badge && (
                      <span className="mb-5 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium">
                        {slide.badge}
                      </span>
                    )}

                    {slide.title && (
                      <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">
                        {slide.title}
                      </h1>
                    )}

                    {slide.description && (
                      <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg">
                        {slide.description}
                      </p>
                    )}

                    {(slide.buttonText || slide.ctaText) &&
                      (slide.buttonLink || slide.ctaLink) && (
                        <Link
                          to={slide.buttonLink || slide.ctaLink}
                          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 font-semibold text-gray-900 shadow-lg transition hover:scale-105"
                        >
                          {slide.buttonText || slide.ctaText}
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