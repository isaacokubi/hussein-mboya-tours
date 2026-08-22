import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Gallery from "../models/Gallery.js";

export const getFeaturedGallery = async (req, res, next) => {
  try {
    requireTenantId();
    const images = await Gallery.find(
      mergeTenantFilter({ active: true, featured: true })
    )
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return res.json({ success: true, count: images.length, images, data: images });
  } catch (error) {
    return next(error);
  }
};

export const healthCheck = async (req, res) => {
  res.json({ success: true, message: "Module operational" });
};
