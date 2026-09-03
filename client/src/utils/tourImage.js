const TOUR_IMAGE_PLACEHOLDER = "/images/image-placeholder.jpg";

// Reliable remote fallbacks. These are used only when a tour record has no
// usable media or when its stored image fails to load in the browser.
const TOUR_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
];

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

const getFallbackIndex = (tour = {}) => {
  const seed = String(
    tour?._id || tour?.slug || tour?.title || tour?.name || "global-tours"
  );
  return Math.abs(
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % TOUR_FALLBACK_IMAGES.length;
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

export const getTourImage = (tour = {}) => {
  const candidates = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.image,
    tour?.thumbnail,
  ];

  const realImage = candidates.find((candidate) => !isGenericImage(candidate));
  const resolved = resolveMediaUrl(realImage);

  // Never intentionally render the placeholder when a tour has no media.
  // Use a deterministic real image instead so every card remains visual.
  return resolved || TOUR_FALLBACK_IMAGES[getFallbackIndex(tour)] || TOUR_IMAGE_PLACEHOLDER;
};

export const getTourImages = (tour = {}) => {
  const media = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
  ]
    .filter((item) => !isGenericImage(item))
    .map(resolveMediaUrl)
    .filter(Boolean);

  if (media.length) return [...new Set(media)];

  const index = getFallbackIndex(tour);
  return [
    TOUR_FALLBACK_IMAGES[index],
    TOUR_FALLBACK_IMAGES[(index + 1) % TOUR_FALLBACK_IMAGES.length],
  ];
};

export { TOUR_FALLBACK_IMAGES };
