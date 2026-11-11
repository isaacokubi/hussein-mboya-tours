/**
 * Purpose: hero Api client application module. Main declarations: getHeroSlides, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare FALLBACK_HERO_SLIDES for use by the surrounding module or function.
const FALLBACK_HERO_SLIDES = [
  {
    _id: "default-hussein-mboya-hero",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=2200&q=92",
    badge: "KENYA SAFARIS • BEACH • ADVENTURE",
    title: "Experience the Magic of Kenya",
    description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
  },
];

// Declare getHeroSlides for use by the surrounding module or function.
export const getHeroSlides = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    const response = await api.get("/hero");
    // Declare slides for use by the surrounding module or function.
    const slides = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.slides)
        ? response.data.slides
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
    // Return the expression shown below to the caller.
    return slides.length ? slides : FALLBACK_HERO_SLIDES;
  } catch (error) {
    // Check the condition (import.meta.env.DEV) and run the matching branch.
    if (import.meta.env.DEV) console.warn("Optional hero CMS content unavailable; using the configured public hero fallback.", error);
    // Return the value of FALLBACK_HERO_SLIDES to the caller.
    return FALLBACK_HERO_SLIDES;
  }
};

// Declare getAll for use by the surrounding module or function.
export const getAll = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/hero");
  // Return the value of data to the caller.
  return data;
};
