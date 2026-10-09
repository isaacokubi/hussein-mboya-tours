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

// Curated, high-resolution travel photography; local assets remain the final fallback.
const HERO_IMAGE_CANDIDATES = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85",
  "/hero1.jpeg",
  "/hero2.jpeg",
  "/hero4.jpeg",
  "/demo-destinations/kenya-landscape-01.svg",
  "/demo-destinations/kenya-landscape-02.svg",
];

const FALLBACK_HERO_SLIDES = [
  {
    _id: "fallback-mara",
    image: HERO_IMAGE_CANDIDATES[0],
    badge: "KENYA SAFARIS • WILDLIFE",
    title: "Experience the Magic of Kenya",
    description: "Discover unforgettable wildlife encounters and wide-open savannahs with local travel experts.",
    buttonText: "Explore Safaris",
    buttonLink: "/tours",
  },
  {
    _id: "fallback-wildlife",
    image: HERO_IMAGE_CANDIDATES[1],
    badge: "WILD KENYA • REAL ADVENTURE",
    title: "Get Closer to the Wild",
    description: "Explore Kenya's iconic parks with thoughtfully planned journeys and experienced local guides.",
    buttonText: "Find Your Safari",
    buttonLink: "/tours",
  },
  {
    _id: "fallback-landscape",
    image: HERO_IMAGE_CANDIDATES[2],
    badge: "TAILOR-MADE KENYA JOURNEYS",
    title: "Make Every Moment Count",
    description: "From golden savannahs to remarkable landscapes, your next adventure starts here.",
    buttonText: "Plan Your Journey",
    buttonLink: "/contact",
  },
  {
    _id: "fallback-coast",
    image: HERO_IMAGE_CANDIDATES[3],
    badge: "INDIAN OCEAN • COASTAL ESCAPES",
    title: "Slow Down on the Kenyan Coast",
    description: "Pair your safari with turquoise waters, white-sand beaches and warm Swahili hospitality.",
    buttonText: "Explore Beach Holidays",
    buttonLink: "/tours",
  },
  {
    _id: "fallback-mountains",
    image: HERO_IMAGE_CANDIDATES[4],
    badge: "MOUNTAINS • NATURE • CULTURE",
    title: "Find Your Own Way Through Kenya",
    description: "Discover highland scenery, cultural encounters and flexible adventures made around you.",
    buttonText: "Build a Custom Trip",
    buttonLink: "/contact",
  },
];

export default function HeroSlider() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const tenantName = String(tenant?.name || tenant?.companyName || "").trim();
  const configuredName = String(settings?.companyName || "").trim();
  const companyName = tenantName || configuredName || "Travel company";
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

  // Never mix a tenant's configured homepage with global slides. A single tenant-managed
  // slide is valid; generic defaults are used only when the tenant has no active slides.
  const apiSlides = Array.isArray(rawSlides) ? rawSlides.filter(Boolean).slice(0, 5) : [];
  const sourceSlides = apiSlides.length ? apiSlides : FALLBACK_HERO_SLIDES;

  const slides = sourceSlides.slice(0, 5).map((slide, index) => ({
    ...slide,
    description: normalizeBrand(slide.description || slide.subtitle || ""),
    title: normalizeBrand(slide.title || "Experience the Magic of Kenya"),
    badge: normalizeBrand(slide.badge || "KENYA SAFARIS • BEACH • ADVENTURE"),
    buttonText: normalizeBrand(slide.buttonText || slide.buttonOne?.text || slide.ctaText || "Explore Tours"),
    buttonLink: slide.buttonLink || slide.buttonOne?.link || slide.ctaLink || "/tours",
    image: slide.image?.url || slide.image || HERO_IMAGE_CANDIDATES[index % HERO_IMAGE_CANDIDATES.length],
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

  return (
    <section className="relative overflow-hidden px-1 py-1">
      <div className="relative h-[62vh] min-h-[480px] max-h-[820px] overflow-hidden rounded-xl shadow-2xl sm:h-[68vh] lg:h-[78vh]">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={900}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={slides.length > 1}
          preloadImages={false}
          className="h-full"
          onSwiper={(swiper) => {
            pauseAllVideos();
            window.setTimeout(() => playVideo(swiper.realIndex), 100);
          }}
          onSlideChange={(swiper) => {
            pauseAllVideos();
            window.setTimeout(() => playVideo(swiper.realIndex), 100);
          }}
        >
          {slides.map((slide, index) => {
            const slideKey = String(slide._id || index);
            const candidateImage = slide.image || HERO_IMAGE_CANDIDATES[index % HERO_IMAGE_CANDIDATES.length];
            const imageUrl = imageOverrides[slideKey] || candidateImage;
            const videoUrl = slide.video;
            const videoLoaded = Boolean(loadedVideos[index]);

            return (
              <SwiperSlide key={slideKey}>
                <div className="relative h-full overflow-hidden bg-slate-950">
                  <img
                    src={imageUrl}
                    alt={slide.title || companyName}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => {
                      const attempts = imageAttempts[slideKey] || 0;
                      const nextIndex = attempts + 1;
                      if (nextIndex >= HERO_IMAGE_CANDIDATES.length) return;
                      setImageAttempts((current) => ({ ...current, [slideKey]: nextIndex }));
                      setImageOverrides((current) => ({
                        ...current,
                        [slideKey]: HERO_IMAGE_CANDIDATES[(index + nextIndex) % HERO_IMAGE_CANDIDATES.length],
                      }));
                    }}
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
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                      onCanPlay={() => {
                        markVideoLoaded(index);
                        if (index === 0) playVideo(index);
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/80" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6">
                    {slide.badge && <span className="mb-4 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur-md sm:mb-5 sm:px-5 sm:py-2 sm:text-sm">{slide.badge}</span>}
                    {slide.title && <h1 className="max-w-5xl text-3xl font-bold leading-tight drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-7xl">{slide.title}</h1>}
                    {slide.description && <p className="mt-4 max-w-3xl text-sm text-white/90 drop-shadow-lg sm:mt-5 sm:text-base md:text-lg lg:text-xl">{slide.description}</p>}
                    {slide.buttonText && slide.buttonLink && <Link to={slide.buttonLink} className="mt-6 inline-flex max-w-full items-center justify-center rounded-full bg-[#e3bd67] px-5 py-2.5 text-sm font-extrabold text-[#17231e] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f0d38b] sm:mt-8 sm:px-7 sm:py-3">{slide.buttonText}</Link>}
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
