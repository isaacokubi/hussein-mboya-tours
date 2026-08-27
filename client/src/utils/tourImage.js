const FALLBACK_TOUR_IMAGES = [
  "/gallery/safari.jpg",
  "/gallery/mara.jpg",
  "/gallery/amboseli.jpg",
  "/gallery/diani.jpg",
  "/gallery/beach.jpg",
  "/gallery/culture.jpg",
  "/hero2.jpeg",
  "/hero4.jpeg",
];

const isGenericImage = (value) => {
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  if (!raw) return true;
  const normalized = raw.toLowerCase();
  return normalized.endsWith("/hero1.jpeg") ||
    normalized.includes("image-placeholder") ||
    normalized.includes("destination-placeholder");
};

export const resolveMediaUrl = (value) => {
  if (!value) return "";
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  const base = String(import.meta.env.VITE_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
  return raw.startsWith("/") && base ? `${base}${raw}` : raw;
};

const stableIndex = (tour) => {
  const stable = String(tour?._id || tour?.slug || tour?.title || "tour");
  return [...stable].reduce(
    (sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0,
    0
  ) % FALLBACK_TOUR_IMAGES.length;
};

export const getTourImage = (tour) => {
  const candidates = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.image,
    tour?.thumbnail,
  ];

  const realImage = candidates.find((candidate) => !isGenericImage(candidate));
  const resolved = resolveMediaUrl(realImage);
  if (resolved) return resolved;

  return FALLBACK_TOUR_IMAGES[stableIndex(tour)] || "/gallery/safari.jpg";
};

export const getTourImages = (tour) => {
  const media = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
  ]
    .filter((item) => !isGenericImage(item))
    .map(resolveMediaUrl)
    .filter(Boolean);

  return media.length ? [...new Set(media)] : [getTourImage(tour)];
};
