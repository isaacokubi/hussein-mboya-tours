import { getTenantContext, mergeTenantFilter } from "../tenancy/context.js";
import Gallery from "../models/Gallery.js";
import Tour from "../models/Tour.js";

const publicTourFilter = {
  published: true,
  available: true,
  isDeleted: false,
};

const isUsableImage = (value) => {
  const url = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";

  if (!url || typeof url !== "string") return false;

  const normalized = url.trim().toLowerCase();
  if (!normalized) return false;

  return !(
    normalized.includes("image-placeholder") ||
    normalized.includes("destination-placeholder") ||
    normalized.endsWith("/hero1.jpeg")
  );
};

const normalizeImage = (value) => {
  if (!isUsableImage(value)) return null;

  if (typeof value === "string") return { url: value };

  const url = value?.url || value?.secure_url || value?.path;
  return url ? { ...value, url } : null;
};

export const getFeaturedGallery = async (req, res, next) => {
  try {
    const context = getTenantContext();
    const platformWide = context.bypass === true;

    const galleryFilter = platformWide
      ? { active: true }
      : mergeTenantFilter({ active: true });

    // Some old gallery records contain the local placeholder image. Exclude
    // those records here so they cannot hide the real tour media fallback.
    const galleryRecords = await Gallery.find(galleryFilter)
      .select("title image category featured createdAt")
      .sort({ featured: -1, createdAt: -1 })
      .limit(50)
      .lean();

    let images = galleryRecords
      .map((item) => {
        const image = normalizeImage(item.image);
        return image ? { ...item, image } : null;
      })
      .filter(Boolean)
      .slice(0, 12);

    // A dedicated gallery is optional. If it has no usable media, build the
    // homepage gallery from real published tour media instead of placeholders.
    if (images.length === 0) {
      const tourFilter = platformWide
        ? { ...publicTourFilter }
        : mergeTenantFilter({ ...publicTourFilter });

      const tours = await Tour.find(tourFilter)
        .select("title featuredImage gallery images image thumbnail category createdAt popularity")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .limit(20)
        .lean();

      images = tours
        .flatMap((tour) => {
          const candidates = [
            tour.featuredImage,
            ...(Array.isArray(tour.gallery) ? tour.gallery : []),
            ...(Array.isArray(tour.images) ? tour.images : []),
            tour.image,
            tour.thumbnail,
          ]
            .map(normalizeImage)
            .filter(Boolean);

          return candidates.slice(0, 4).map((image, index) => ({
            _id: `tour-${tour._id}-${index}`,
            title: tour.title,
            image,
            category: tour.category || "Safari",
            featured: true,
            source: "tour",
            createdAt: tour.createdAt,
          }));
        })
        .filter((item) => item.image?.url)
        .slice(0, 12);
    }

    return res.json({
      success: true,
      count: images.length,
      images,
      data: images,
    });
  } catch (error) {
    return next(error);
  }
};

export const healthCheck = async (req, res) => {
  res.json({ success: true, message: "Module operational" });
};
