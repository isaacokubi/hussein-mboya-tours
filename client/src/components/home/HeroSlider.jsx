/**
 * Purpose: Hero Slider reusable UI component. Main declarations: HeroSlider, normalizeBrand, markVideoLoaded, playVideo, pauseAllVideos.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useTenant } from "../../context/TenantContext";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";
// Load react so this module can use its exported dependencies.
import { useEffect, useRef, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load swiper/react so this module can use its exported dependencies.
import { Swiper, SwiperSlide } from "swiper/react";
// Load swiper/modules so this module can use its exported dependencies.
import { Autoplay, EffectFade } from "swiper/modules";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load ../../api/heroApi so this module can use its exported dependencies.
import { getHeroSlides } from "../../api/heroApi";
// Load swiper/css so this module can use its exported dependencies.
import "swiper/css";
// Load swiper/css/effect-fade so this module can use its exported dependencies.
import "swiper/css/effect-fade";

// Curated, high-resolution travel photography; local assets remain the final fallback.
// Declare HERO_IMAGE_CANDIDATES for use by the surrounding module or function.
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

// Declare FALLBACK_HERO_SLIDES for use by the surrounding module or function.
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

// Define HeroSlider; its parameters and body implement this operation.
export default function HeroSlider() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant() || {};
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare tenantName for use by the surrounding module or function.
  const tenantName = String(tenant?.name || tenant?.companyName || "").trim();
  // Declare configuredName for use by the surrounding module or function.
  const configuredName = String(settings?.companyName || "").trim();
  // Declare companyName for use by the surrounding module or function.
  const companyName = tenantName || configuredName || "Hussein Mboya Tours";
  // Declare tenantKey for use by the surrounding module or function.
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || companyName;
  // Declare videoRefs for use by the surrounding module or function.
  const videoRefs = useRef([]);
  // Declare [heroReady, setHeroReady] for use by the surrounding module or function.
  const [heroReady, setHeroReady] = useState(false);
  // Declare [loadedVideos, setLoadedVideos] for use by the surrounding module or function.
  const [loadedVideos, setLoadedVideos] = useState({});
  // Declare [imageOverrides, setImageOverrides] for use by the surrounding module or function.
  const [imageOverrides, setImageOverrides] = useState({});
  // Declare [imageAttempts, setImageAttempts] for use by the surrounding module or function.
  const [imageAttempts, setImageAttempts] = useState({});
  // Declare { data: rawSlides = [] } for use by the surrounding module or function.
  const { data: rawSlides = [] } = useQuery({
    queryKey: ["heroSlides", tenantKey],
    queryFn: getHeroSlides,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Declare normalizeBrand for use by the surrounding module or function.
  const normalizeBrand = (value) => {
    // Check the condition (typeof value !== "string") and run the matching branch.
    if (typeof value !== "string") return value;
    // Return the result of value       .replace(/\{\{\s*companyName\s*\}\}/gi, companyName)       .replace(/\bYour Travel Company\b/gi, companyName)       .replace() to the caller.
    return value
      .replace(/\{\{\s*companyName\s*\}\}/gi, companyName)
      .replace(/\bYour Travel Company\b/gi, companyName)
      .replace(/\bGlobal Tours\b/gi, companyName);
  };

  // Keep tenant-managed slides when there are several. If the API only returns one
  // slide, supplement it with curated slides so the hero still rotates through images.
  // Declare apiSlides for use by the surrounding module or function.
  const apiSlides = Array.isArray(rawSlides) ? rawSlides.filter(Boolean).slice(0, 5) : [];
  // Declare sourceSlides for use by the surrounding module or function.
  const sourceSlides = apiSlides.length >= 2
    ? apiSlides
    : apiSlides.length === 1
      ? [apiSlides[0], ...FALLBACK_HERO_SLIDES.slice(1)]
      : FALLBACK_HERO_SLIDES;

  // Declare slides for use by the surrounding module or function.
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

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare timer for use by the surrounding module or function.
    const timer = window.setTimeout(() => setHeroReady(true), 1200);
    // Return the expression shown below to the caller.
    return () => window.clearTimeout(timer);
  }, []);

  // Declare markVideoLoaded for use by the surrounding module or function.
  const markVideoLoaded = (index) => setLoadedVideos((current) => ({ ...current, [index]: true }));
  // Declare playVideo for use by the surrounding module or function.
  const playVideo = (index) => {
    // Declare video for use by the surrounding module or function.
    const video = videoRefs.current[index];
    // Check the condition (!video || !heroReady) and run the matching branch.
    if (!video || !heroReady) return;
    // Perform the side effect or state update expressed on the following line.
    video.play().catch(() => {});
  };
  // Declare pauseAllVideos for use by the surrounding module or function.
  const pauseAllVideos = () => videoRefs.current.forEach((video) => video?.pause());

  // Return the expression shown below to the caller.
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
