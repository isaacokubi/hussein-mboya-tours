import api from "./axios";

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

export const getHeroSlides = async () => {
  try {
    const response = await api.get("/hero");
    const slides = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.slides)
        ? response.data.slides
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
    return slides.length ? slides : FALLBACK_HERO_SLIDES;
  } catch (error) {
    if (import.meta.env.DEV) console.warn("Optional hero CMS content unavailable; using the configured public hero fallback.", error);
    return FALLBACK_HERO_SLIDES;
  }
};

export const getAll = async () => {
  const { data } = await api.get("/hero");
  return data;
};
