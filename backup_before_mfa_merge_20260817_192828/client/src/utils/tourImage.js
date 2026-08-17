const FALLBACK_TOUR_IMAGES = [
  "/gallery/safari.jpg",
  "/gallery/mara.jpg",
  "/gallery/amboseli.jpg",
  "/gallery/diani.jpg",
  "/gallery/beach.jpg",
  "/gallery/culture.jpg",
];

export const resolveMediaUrl = (value) => {
  if (!value) return "";
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  const base = String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "").replace(/\/$/, "");
  return raw.startsWith("/") && base ? `${base}${raw}` : raw;
};

export const getTourImage = (tour, index = 0) => {
  const candidates = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.image,
    tour?.thumbnail,
  ];
  const resolved = resolveMediaUrl(candidates[index] || candidates[0]);
  if (resolved) return resolved;
  const stable = String(tour?._id || tour?.slug || tour?.title || "tour");
  const hash = [...stable].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
  return FALLBACK_TOUR_IMAGES[hash % FALLBACK_TOUR_IMAGES.length] || "/hero1.jpeg";
};

export const getTourImages = (tour) => {
  const media = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
  ].map(resolveMediaUrl).filter(Boolean);
  return media.length ? [...new Set(media)] : [getTourImage(tour)];
};
