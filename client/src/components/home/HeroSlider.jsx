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

const FALLBACK_HERO_SLIDES = [
  { _id: "fallback-1", image: "/hero1.jpeg", title: "Discover Kenya with Your Travel Company", description: "Unforgettable safaris, wildlife adventures and tailor-made African experiences.", buttonText: "Explore Tours", buttonLink: "/tours" },
  { _id: "fallback-2", image: "/hero2.jpeg", title: "Experience the Magic of Kenya", description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.", buttonText: "View Destinations", buttonLink: "/destinations" },
  { _id: "fallback-3", image: "/hero4.jpeg", title: "Your African Adventure Starts Here", description: "Travel safely, comfortably and confidently with Your Travel Company.", buttonText: "Book Now", buttonLink: "/tours" },
];

export default function HeroSlider() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Your Travel Company";
  const videoRefs = useRef([]);
  const [heroReady, setHeroReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState({});

  // Never block the first paint on the API. The local hero images render immediately,
  // while the CMS request refreshes the slides in the background.
  const { data: slides = FALLBACK_HERO_SLIDES } = useQuery({
    queryKey: ["heroSlides", settings?.companyName || "default"],
    queryFn: getHeroSlides,
    initialData: FALLBACK_HERO_SLIDES,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const markVideoLoaded = (index) => setLoadedVideos((current) => ({ ...current, [index]: true }));
  const playVideo = (index) => {
    const video = videoRefs.current[index];
    if (!video || !heroReady) return;
    video.play().catch(() => {});
  };
  const pauseAllVideos = () => videoRefs.current.forEach((video) => video?.pause());

  return (
    <section className="relative px-1 py-1 overflow-hidden">
      <div className="relative h-[85vh] rounded-xl overflow-hidden shadow-2xl">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={900}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={slides.length > 1}
          preloadImages={false}
          className="h-full"
          onSwiper={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }}
          onSlideChange={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }}
        >
          {slides.map((slide, index) => {
            const imageUrl = slide.image?.url || slide.image || "/hero1.jpeg";
            const videoUrl = slide.video?.url || slide.video;
            const videoLoaded = Boolean(loadedVideos[index]);
            return (
              <SwiperSlide key={slide._id || index}>
                <div className="relative h-full overflow-hidden bg-gray-900">
                  <img
                    src={imageUrl}
                    alt={slide.title || companyName}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {videoUrl && heroReady && (
                    <video
                      ref={(el) => { videoRefs.current[index] = el; }}
                      src={videoUrl}
                      muted
                      playsInline
                      loop
                      preload={index === 0 ? "metadata" : "none"}
                      poster={imageUrl}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                      onCanPlay={() => { markVideoLoaded(index); if (index === 0) playVideo(index); }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 text-white">
                    {slide.badge && <span className="mb-5 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium">{slide.badge}</span>}
                    {slide.title && <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">{slide.title}</h1>}
                    {slide.description && <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg">{slide.description}</p>}
                    {(slide.buttonText || slide.ctaText) && (slide.buttonLink || slide.ctaLink) && (
                      <Link to={slide.buttonLink || slide.ctaLink} className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 font-semibold text-gray-900 shadow-lg transition hover:scale-105">
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
