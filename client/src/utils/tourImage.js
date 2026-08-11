export const resolveMediaUrl = (value) => {
  if (!value) return "";
  const raw = typeof value === "string" ? value : value?.url || value?.secure_url || value?.path || "";
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
  return resolveMediaUrl(candidates[index] || candidates[0]) || "/placeholder.jpg";
};
