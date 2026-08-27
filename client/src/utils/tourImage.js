const TOUR_IMAGE_PLACEHOLDER = "/images/image-placeholder.jpg";

const isGenericImage = (value) => {
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  if (!raw) return true;
  const normalized = raw.toLowerCase().trim();
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

export const getTourImage = (tour) => {
  const candidates = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.image,
    tour?.thumbnail,
  ];

  const realImage = candidates.find((candidate) => !isGenericImage(candidate));
  return resolveMediaUrl(realImage) || TOUR_IMAGE_PLACEHOLDER;
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

  return media.length ? [...new Set(media)] : [TOUR_IMAGE_PLACEHOLDER];
};
