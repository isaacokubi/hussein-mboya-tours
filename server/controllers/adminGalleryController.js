import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Gallery from "../models/Gallery.js";

export const getAdminGallery = async (req, res, next) => {
  try {
    requireTenantId();
    const gallery = await Gallery.find(tenantFilter(req)).sort({ createdAt: -1 });
    res.json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    next(error);
  }
};

export const uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });
    res.json({ success: true, image: { url: req.file.path, publicId: req.file.filename } });
  } catch (error) {
    next(error);
  }
};

export const createAdminGallery = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { title, category, featured, active, imageUrl, publicId } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });
    if (!imageUrl?.trim()) return res.status(400).json({ success: false, message: "Image URL is required" });

    const item = await Gallery.create({
      tenantId,
      title: title.trim(),
      category: category?.trim() || "Safari",
      featured: Boolean(featured),
      active: active !== false,
      image: { url: imageUrl.trim(), publicId: publicId || "" },
    });
    res.status(201).json({ success: true, gallery: item });
  } catch (error) {
    next(error);
  }
};

export const updateAdminGallery = async (req, res, next) => {
  try {
    requireTenantId();
    const { title, category, featured, active, imageUrl, publicId } = req.body;
    const update = {
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(category !== undefined ? { category: String(category).trim() } : {}),
      ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    };
    if (imageUrl) update.image = { url: String(imageUrl).trim(), publicId: publicId || "" };

    const item = await Gallery.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      update,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, gallery: item });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminGallery = async (req, res, next) => {
  try {
    requireTenantId();
    const item = await Gallery.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    next(error);
  }
};
