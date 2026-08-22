import api from "./axios";

const FALLBACK_HERO_SLIDES = [
  {
    _id: "hussein-mboya-default-1",
    image: "/hero1.jpeg",
    title: "Discover Kenya with Hussein Mboya Tours",
    description: "Unforgettable safaris, wildlife adventures and tailor-made African experiences.",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
  },
  {
    _id: "hussein-mboya-default-2",
    image: "/hero2.jpeg",
    title: "Experience the Magic of Kenya",
    description: "From the Maasai Mara to the coast, discover extraordinary places with local experts.",
    buttonText: "View Destinations",
    buttonLink: "/destinations",
  },
  {
    _id: "hussein-mboya-default-3",
    image: "/hero4.jpeg",
    title: "Your African Adventure Starts Here",
    description: "Travel safely, comfortably and confidently with Hussein Mboya Tours.",
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
    // A public marketing homepage must remain usable when optional CMS
    // content is unavailable. Keep the tenant's built-in hero assets visible.
    return FALLBACK_HERO_SLIDES;
  }
};

export const getAll = async () => {
  const { data } = await api.get("/hero");
  return data;
};
