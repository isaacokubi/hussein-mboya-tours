/**
 * Purpose: tour Image client application module. Main declarations: isGenericImage, getFallbackIndex, resolveMediaUrl, getTourImage, getTourImages.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const TOUR_IMAGE_PLACEHOLDER = "/images/image-placeholder.jpg";

// Reliable remote fallbacks. These are used only when a tour record has no
// usable media or when its stored image fails to load in the browser.
// Declare TOUR_FALLBACK_IMAGES for use by the surrounding module or function.
const TOUR_FALLBACK_IMAGES = [
  "/gallery/mara.jpg",
  "/gallery/amboseli.jpg",
  "/gallery/diani.jpg",
  "/gallery/beach.jpg",
  "/gallery/safari.jpg",
  "/gallery/culture.jpg",
  "/destinations/maasai-mara.jpg",
  "/destinations/amboseli.jpg",
  "/destinations/diani.jpg",
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

];

// Declare isGenericImage for use by the surrounding module or function.
const isGenericImage = (value) => {
  // Declare raw for use by the surrounding module or function.
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  // Check the condition (!raw) and run the matching branch.
  if (!raw) return true;
  // Declare normalized for use by the surrounding module or function.
  const normalized = raw.toLowerCase().trim();
  // Return the expression shown below to the caller.
  return normalized.endsWith("/hero1.jpeg") ||
    normalized.includes("image-placeholder") ||
    normalized.includes("destination-placeholder");
};

// Declare getFallbackIndex for use by the surrounding module or function.
const getFallbackIndex = (tour = {}) => {
  // Declare seed for use by the surrounding module or function.
  const seed = String(
    tour?._id || tour?.slug || tour?.title || tour?.name || "global-tours"
  );
  // Return the expression shown below to the caller.
  return Math.abs(
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % TOUR_FALLBACK_IMAGES.length;
};

// Declare resolveMediaUrl for use by the surrounding module or function.
export const resolveMediaUrl = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare raw for use by the surrounding module or function.
  const raw = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";
  // Check the condition (!raw) and run the matching branch.
  if (!raw) return "";
  // Check the condition (/^(https?:|data:|blob:)/i.test(raw)) and run the matching branch.
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  // Check the condition (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/her) and run the matching branch.
  if (/^\/(?:destinations|gallery|demo-destinations)\//.test(raw) || /^\/hero\d+\.(?:jpe?g|png|webp)$/i.test(raw)) return raw;
  // Declare base for use by the surrounding module or function.
  const base = String(import.meta.env.VITE_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
  // Return the expression shown below to the caller.
  return raw.startsWith("/") && base ? `${base}${raw}` : raw;
};

// Declare getTourImage for use by the surrounding module or function.
export const getTourImage = (tour = {}) => {
  // Declare candidates for use by the surrounding module or function.
  const candidates = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.image,
    tour?.thumbnail,
  ];

  // Declare realImage for use by the surrounding module or function.
  const realImage = candidates.find((candidate) => !isGenericImage(candidate));
  // Declare resolved for use by the surrounding module or function.
  const resolved = resolveMediaUrl(realImage);

  // Never intentionally render the placeholder when a tour has no media.
  // Use a deterministic real image instead so every card remains visual.
  // Return the expression shown below to the caller.
  return resolved || TOUR_FALLBACK_IMAGES[getFallbackIndex(tour)] || TOUR_IMAGE_PLACEHOLDER;
};

// Declare getTourImages for use by the surrounding module or function.
export const getTourImages = (tour = {}) => {
  // Declare media for use by the surrounding module or function.
  const media = [
    tour?.featuredImage,
    ...(Array.isArray(tour?.gallery) ? tour.gallery : []),
    ...(Array.isArray(tour?.images) ? tour.images : []),
  ]
    .filter((item) => !isGenericImage(item))
    .map(resolveMediaUrl)
    .filter(Boolean);

  // Check the condition (media.length) and run the matching branch.
  if (media.length) return [...new Set(media)];

  // Declare index for use by the surrounding module or function.
  const index = getFallbackIndex(tour);
  // Return the collection assembled below to the caller.
  return [
    TOUR_FALLBACK_IMAGES[index],
    TOUR_FALLBACK_IMAGES[(index + 1) % TOUR_FALLBACK_IMAGES.length],
  ];
};

// Expose the selected declarations or re-exported members to other parts of the application.
export { TOUR_FALLBACK_IMAGES };
