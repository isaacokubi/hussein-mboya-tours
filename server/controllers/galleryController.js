/**
 * Purpose: gallery Controller HTTP controller. Main declarations: isUsableImage, normalizeImage, getFeaturedGallery, healthCheck.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getTenantContext, mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Gallery.js so this module can use its exported dependencies.
import Gallery from "../models/Gallery.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare publicTourFilter for use by the surrounding module or function.
const publicTourFilter = {
  published: true,
  available: true,
  isDeleted: false,
};

// Declare isUsableImage for use by the surrounding module or function.
const isUsableImage = (value) => {
  // Declare url for use by the surrounding module or function.
  const url = typeof value === "string"
    ? value
    : value?.url || value?.secure_url || value?.path || "";

  // Check the condition (!url || typeof url !== "string") and run the matching branch.
  if (!url || typeof url !== "string") return false;

  // Declare normalized for use by the surrounding module or function.
  const normalized = url.trim().toLowerCase();
  // Check the condition (!normalized) and run the matching branch.
  if (!normalized) return false;

  // Return the expression shown below to the caller.
  return !(
    normalized.includes("image-placeholder") ||
    normalized.includes("destination-placeholder") ||
    normalized.endsWith("/hero1.jpeg")
  );
};

// Declare normalizeImage for use by the surrounding module or function.
const normalizeImage = (value) => {
  // Check the condition (!isUsableImage(value)) and run the matching branch.
  if (!isUsableImage(value)) return null;

  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return { url: value };

  // Declare url for use by the surrounding module or function.
  const url = value?.url || value?.secure_url || value?.path;
  // Return the expression shown below to the caller.
  return url ? { ...value, url } : null;
};

// Declare getFeaturedGallery for use by the surrounding module or function.
export const getFeaturedGallery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare context for use by the surrounding module or function.
    const context = getTenantContext();
    // Declare platformWide for use by the surrounding module or function.
    const platformWide = context.bypass === true;

    // Declare galleryFilter for use by the surrounding module or function.
    const galleryFilter = platformWide
      ? { active: true }
      : mergeTenantFilter({ active: true });

    // Some old gallery records contain the local placeholder image. Exclude
    // those records here so they cannot hide the real tour media fallback.
    // Declare galleryRecords for use by the surrounding module or function.
    const galleryRecords = await Gallery.find(galleryFilter)
      .select("title image category featured createdAt")
      .sort({ featured: -1, createdAt: -1 })
      .limit(50)
      .lean();

    // Declare images for use by the surrounding module or function.
    let images = galleryRecords
      .map((item) => {
        // Declare image for use by the surrounding module or function.
        const image = normalizeImage(item.image);
        // Return the expression shown below to the caller.
        return image ? { ...item, image } : null;
      })
      .filter(Boolean)
      .slice(0, 12);

    // A dedicated gallery is optional. If it has no usable media, build the
    // homepage gallery from real published tour media instead of placeholders.
    // Check the condition (images.length === 0) and run the matching branch.
    if (images.length === 0) {
      // Declare tourFilter for use by the surrounding module or function.
      const tourFilter = platformWide
        ? { ...publicTourFilter }
        : mergeTenantFilter({ ...publicTourFilter });

      // Declare tours for use by the surrounding module or function.
      const tours = await Tour.find(tourFilter)
        .select("title featuredImage gallery images image thumbnail category createdAt popularity")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .limit(20)
        .lean();

      // Perform the side effect or state update expressed on the following line.
      images = tours
        .flatMap((tour) => {
          // Declare candidates for use by the surrounding module or function.
          const candidates = [
            tour.featuredImage,
            ...(Array.isArray(tour.gallery) ? tour.gallery : []),
            ...(Array.isArray(tour.images) ? tour.images : []),
            tour.image,
            tour.thumbnail,
          ]
            .map(normalizeImage)
            .filter(Boolean);

          // Return the result of candidates.slice(0, 4).map() to the caller.
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

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      count: images.length,
      images,
      data: images,
    });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare healthCheck for use by the surrounding module or function.
export const healthCheck = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  res.json({ success: true, message: "Module operational" });
};
