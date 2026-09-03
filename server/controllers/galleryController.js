import { getTenantContext, mergeTenantFilter } from "../tenancy/context.js";
import Gallery from "../models/Gallery.js";
import Tour from "../models/Tour.js";

const publicTourFilter = {
  published: true,
  available: true,
  isDeleted: false,
};

export const getFeaturedGallery = async (req, res, next) => {
  try {
    const context = getTenantContext();
    const platformWide = context.bypass === true;

    // Match the public tour endpoint: platform requests may read globally,
    // while normal public requests are strictly limited to the resolved tenant.
    const galleryFilter = platformWide
      ? { active: true }
      : mergeTenantFilter({ active: true });

    let images = await Gallery.find(galleryFilter)
      .select("title image category featured createdAt")
      .sort({ featured: -1, createdAt: -1 })
      .limit(12)
      .lean();

    // A dedicated gallery is optional. If it is empty, build the homepage
    // gallery from real published tour media instead of inventing URLs.
    if (images.length === 0) {
      const tourFilter = platformWide
        ? { ...publicTourFilter }
        : mergeTenantFilter({ ...publicTourFilter });

      const tours = await Tour.find(tourFilter)
        .select("title featuredImage gallery category createdAt popularity")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .limit(12)
        .lean();

      images = tours
        .flatMap((tour) => {
          const candidates = [
            ...(tour.featuredImage?.url
              ? [{ url: tour.featuredImage.url, publicId: tour.featuredImage.publicId }]
              : []),
            ...(Array.isArray(tour.gallery)
              ? tour.gallery.filter((image) => image?.url)
              : []),
          ];

          return candidates.slice(0, 4).map((image, index) => ({
            _id: `tour-${tour._id}-${index}`,
            title: tour.title,
            image: typeof image === "string" ? { url: image } : image,
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
