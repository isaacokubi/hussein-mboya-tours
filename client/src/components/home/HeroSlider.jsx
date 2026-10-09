import { useTenant } from "../../context/TenantContext";
import { useSettings } from "../../context/SettingsContext";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";
import { getHeroSlides } from "../../api/heroApi";
import "swiper/css";
import "swiper/css/effect-fade";

// Keep hero artwork local so the first screen does not depend on a third-party image host.
const LOCAL_HERO_IMAGES = [
  "/hero1.jpeg",
  "/hero2.jpeg",
  "/hero4.jpeg",
  "/demo-destinations/kenya-landscape-01.svg",
  "/demo-destinations/kenya-landscape-02.svg",
];

const FALLBACK_HERO_SLIDES = [
  {
    _id: "fallback-hero",
    image: LOCAL_HERO_IMAGES[0],
    badge: "KENYA SAFARIS • BEACH • ADVENTURE",
    title: "Experience the Magic of Kenya",
    description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
  },
];

export default function HeroSlider() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const tenantName = String(tenant?.name || tenant?.companyName || "").trim();
  const configuredName = String(settings?.companyName || "").trim();
  const companyName = tenantName || configuredName || "Hussein Mboya Tours";
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || companyName;
  const videoRefs = useRef([]);
  const [heroReady, setHeroReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState({});
  const [imageOverrides, setImageOverrides] = useState({});
  const [imageAttempts, setImageAttempts] = useState({});
  const { data: rawSlides = [] } = useQuery({
    queryKey: ["heroSlides", tenantKey],
    queryFn: getHeroSlides,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const normalizeBrand = (value) => {
    if (typeof value !== "string") return value;
    return value
      .replace(/\{\{\s*companyName\s*\}\}/gi, companyName)
      .replace(/\bYour Travel Company\b/gi, companyName)
      .replace(/\bGlobal Tours\b/gi, companyName);
  };

  const sourceSlides = (Array.isArray(rawSlides) && rawSlides.length > 0 ? rawSlides : FALLBACK_HERO_SLIDES).slice(0, 5);
  const slides = sourceSlides.map((slide) => ({
    ...slide,
    description: normalizeBrand(slide.description || slide.subtitle || ""),
    title: normalizeBrand(slide.title || "Experience the Magic of Kenya"),
    badge: normalizeBrand(slide.badge || "KENYA SAFARIS • BEACH • ADVENTURE"),
    buttonText: normalizeBrand(slide.buttonText || slide.buttonOne?.text || slide.ctaText || "Explore Tours"),
    buttonLink: slide.buttonLink || slide.buttonOne?.link || slide.ctaLink || "/tours",
    image: slide.image?.url || slide.image || "",
    video: slide.video?.url || slide.video || "",
  }));

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

  return <section className="relative overflow-hidden px-1 py-1"><div className="relative h-[62vh] min-h-[480px] max-h-[820px] overflow-hidden rounded-xl shadow-2xl sm:h-[68vh] lg:h-[78vh]">
    <Swiper modules={[Autoplay, EffectFade]} effect="fade" speed={900} autoplay={{ delay: 6000, disableOnInteraction: false }} loop={slides.length > 1} preloadImages={false} className="h-full" onSwiper={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }} onSlideChange={(swiper) => { pauseAllVideos(); window.setTimeout(() => playVideo(swiper.realIndex), 100); }}>
      {slides.map((slide, index) => {
        const slideKey = String(slide._id || index);
        const candidateImage = slide.image || LOCAL_HERO_IMAGES[index % LOCAL_HERO_IMAGES.length];
        const imageUrl = imageOverrides[slideKey] || candidateImage;
        const videoUrl = slide.video;
        const videoLoaded = Boolean(loadedVideos[index]);
        return <SwiperSlide key={slideKey}><div className="relative h-full overflow-hidden bg-slate-950">
          <img
            src={imageUrl}
            alt={slide.title || companyName}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(event) => {
              const attempts = imageAttempts[slideKey] || 0;
              if (attempts >= LOCAL_HERO_IMAGES.length) {
                event.currentTarget.style.display = "none";
                return;
              }
              const fallbackIndex = (index + attempts + 1) % LOCAL_HERO_IMAGES.length;
              const fallbackUrl = LOCAL_HERO_IMAGES[fallbackIndex];
              setImageAttempts((current) => ({ ...current, [slideKey]: attempts + 1 }));
              setImageOverrides((current) => ({ ...current, [slideKey]: fallbackUrl }));
            }}
          />
          {videoUrl && heroReady && <video ref={(el) => { videoRefs.current[index] = el; }} src={videoUrl} muted playsInline loop preload={index === 0 ? "metadata" : "none"} poster={imageUrl} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`} onCanPlay={() => { markVideoLoaded(index); if (index === 0) playVideo(index); }} />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/80" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6">
            {slide.badge && <span className="mb-4 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur-md sm:mb-5 sm:px-5 sm:py-2 sm:text-sm">{slide.badge}</span>}
            {slide.title && <h1 className="max-w-5xl text-3xl font-bold leading-tight drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-7xl">{slide.title}</h1>}
            {slide.description && <p className="mt-4 max-w-3xl text-sm text-white/90 drop-shadow-lg sm:mt-5 sm:text-base md:text-lg lg:text-xl">{slide.description}</p>}
            {slide.buttonText && slide.buttonLink && <Link to={slide.buttonLink} className="mt-6 inline-flex max-w-full items-center justify-center rounded-full bg-[#e3bd67] px-5 py-2.5 text-sm font-extrabold text-[#17231e] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f0d38b] sm:mt-8 sm:px-7 sm:py-3">{slide.buttonText}</Link>}
          </div>
        </div></SwiperSlide>;
      })}
    </Swiper>
  </div></section>;
}
