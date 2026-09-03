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

const PROFESSIONAL_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=2200&q=92",
  "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2200&q=92",
  "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=2200&q=92",
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2200&q=92",
];

const FALLBACK_HERO_SLIDES = [
  { _id: "fallback-1", image: PROFESSIONAL_HERO_IMAGES[0], title: "Discover Kenya with Global Tours", description: "Unforgettable safaris, wildlife adventures and tailor-made African experiences.", buttonText: "Explore Tours", buttonLink: "/tours" },
  { _id: "fallback-2", image: PROFESSIONAL_HERO_IMAGES[1], title: "Experience the Magic of Kenya", description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.", buttonText: "View Destinations", buttonLink: "/destinations" },
  { _id: "fallback-3", image: PROFESSIONAL_HERO_IMAGES[2], title: "Your African Adventure Starts Here", description: "Travel safely, comfortably and confidently with Global Tours.", buttonText: "Book Now", buttonLink: "/tours" },
  { _id: "fallback-4", image: PROFESSIONAL_HERO_IMAGES[3], title: "Safari, Coast & Adventure", description: "Build a seamless Kenya journey from wildlife and mountains to the Indian Ocean.", buttonText: "Plan Your Trip", buttonLink: "/tours" },
];

const isOldLocalHero = (url = "") => /^\/hero(?:1|2|4)\.jpeg$/i.test(url.trim());

export default function HeroSlider() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const companyName = settings?.companyName || tenant?.name || tenant?.companyName || "Global Tours";
  const videoRefs = useRef([]);
  const [heroReady, setHeroReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState({});
  const { data: slides = FALLBACK_HERO_SLIDES } = useQuery({ queryKey: ["heroSlides", settings?.companyName || "default"], queryFn: getHeroSlides, initialData: FALLBACK_HERO_SLIDES, staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60, refetchOnWindowFocus: false, retry: 0 });
  useEffect(() => { const timer = window.setTimeout(() => setHeroReady(true), 1200); return () => window.clearTimeout(timer); }, []);
  const markVideoLoaded = (index) => setLoadedVideos((current) => ({ ...current, [index]: true }));
  const playVideo = (index) => { const video = videoRefs.current[index]; if (!video || !heroReady) return; video.play().catch(() => {}); };
  const pauseAllVideos = () => videoRefs.current.forEach((video) => video?.pause());

  return <section className="relative overflow-hidden px-1 py-1"><div className="relative h-[58vh] min-h-[430px] max-h-[820px] overflow-hidden rounded-xl shadow-2xl sm:h-[68vh] lg:h-[78vh]">
    <Swiper modules={[Autoplay, EffectFade]} effect="fade" speed={900} autoplay={{ delay: 6000, disableOnInteraction: false }} loop={slides.length > 1} preloadImages={false} className="h-full" onSwiper={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }} onSlideChange={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }}>
      {slides.map((slide, index) => {
        const candidateImage = slide.image?.url || slide.image;
        const imageUrl = candidateImage && !isOldLocalHero(candidateImage) ? candidateImage : PROFESSIONAL_HERO_IMAGES[index % PROFESSIONAL_HERO_IMAGES.length];
        const videoUrl = slide.video?.url || slide.video;
        const videoLoaded = Boolean(loadedVideos[index]);
        return <SwiperSlide key={slide._id || index}><div className="relative h-full overflow-hidden bg-slate-950">
          <img src={imageUrl} alt={slide.title || companyName} className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoLoaded ? "opacity-0" : "opacity-100"}`} fetchPriority={index === 0 ? "high" : "auto"} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          {videoUrl && heroReady && <video ref={(el) => { videoRefs.current[index] = el; }} src={videoUrl} muted playsInline loop preload={index === 0 ? "metadata" : "none"} poster={imageUrl} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`} onCanPlay={() => { markVideoLoaded(index); if (index === 0) playVideo(index); }} />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/80" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6">
            {slide.badge && <span className="mb-4 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur-md sm:mb-5 sm:px-5 sm:py-2 sm:text-sm">{slide.badge}</span>}
            {slide.title && <h1 className="max-w-5xl text-3xl font-bold leading-tight drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-7xl">{slide.title}</h1>}
            {slide.description && <p className="mt-4 max-w-3xl text-sm text-white/90 drop-shadow-lg sm:mt-5 sm:text-base md:text-lg lg:text-xl">{slide.description}</p>}
            {(slide.buttonText || slide.ctaText) && (slide.buttonLink || slide.ctaLink) && <Link to={slide.buttonLink || slide.ctaLink} className="mt-6 inline-flex max-w-full items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-105 sm:mt-8 sm:px-7 sm:py-3">{slide.buttonText || slide.ctaText}</Link>}
          </div>
        </div></SwiperSlide>;
      })}
    </Swiper>
  </div></section>;
}
