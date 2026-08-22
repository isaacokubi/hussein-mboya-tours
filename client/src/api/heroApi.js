import api from "./axios";

const FALLBACK_HERO_SLIDES = [
  {
    _id: "default-tour-fallback-1",
    image: "/hero1.jpeg",
    title: "Discover Kenya with Your Travel Company",
    description: "Unforgettable safaris, wildlife adventures and tailor-made African experiences.",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
  },
  {
    _id: "default-tour-fallback-2",
    image: "/hero2.jpeg",
    title: "Experience the Magic of Kenya",
    description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.",
    buttonText: "View Destinations",
    buttonLink: "/destinations",
  },
  {
    _id: "default-tour-fallback-3",
    image: "/hero4.jpeg",
    title: "Your African Adventure Starts Here",
    description: "Travel safely, comfortably and confidently with Your Travel Company.",
    buttonText: "Book Now",
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
  } catch {
    // Optional CMS content must not blank the public tenant homepage.
    return FALLBACK_HERO_SLIDES;
  }
};

export const getAll = async () => {
  const { data } = await api.get("/hero");
  return data;
};
