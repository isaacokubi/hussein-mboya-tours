import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Gallery from "../models/Gallery.js";
import Tour from "../models/Tour.js";

export const getFeaturedGallery = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const galleryFilter = mergeTenantFilter({ active: true });

    // Featured images are preferred, but the homepage should not become empty
    // just because an admin has not marked gallery records as featured yet.
    let images = await Gallery.find(galleryFilter)
      .select("title image category featured createdAt")
      .sort({ featured: -1, createdAt: -1 })
      .limit(12)
      .lean();

    // If this tenant has no Gallery records yet, reuse published tour imagery
    // as a safe homepage fallback. This keeps the Safari Gallery useful while
    // the admin builds the dedicated gallery, without inventing image URLs.
    if (images.length === 0) {
      const tours = await Tour.find(
        mergeTenantFilter({
          published: true,
          available: true,
          isDeleted: false,
        })
      )
        .select("title featuredImage gallery category createdAt")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .limit(6)
        .lean();

      images = tours.flatMap((tour) => {
        const candidates = [
          ...(tour.featuredImage?.url ? [{ url: tour.featuredImage.url, publicId: tour.featuredImage.publicId }] : []),
          ...(Array.isArray(tour.gallery) ? tour.gallery.filter((image) => image?.url) : []),
        ];

        return candidates.slice(0, 4).map((image, index) => ({
          _id: `tour-${tour._id}-${index}`,
          title: tour.title,
          image,
          category: tour.category || "Safari",
          featured: true,
          source: "tour",
          createdAt: tour.createdAt,
        }));
      }).slice(0, 12);
    }

    return res.json({ success: true, count: images.length, images, data: images, tenantId });
  } catch (error) {
    return next(error);
  }
};

export const healthCheck = async (req, res) => {
  res.json({ success: true, message: "Module operational" });
};
