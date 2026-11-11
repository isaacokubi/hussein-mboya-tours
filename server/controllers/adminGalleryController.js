/**
 * Purpose: admin Gallery Controller HTTP controller. Main declarations: getAdminGallery, uploadGalleryImage, createAdminGallery, updateAdminGallery, deleteAdminGallery.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Gallery.js so this module can use its exported dependencies.
import Gallery from "../models/Gallery.js";

// Declare getAdminGallery for use by the surrounding module or function.
export const getAdminGallery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare gallery for use by the surrounding module or function.
    const gallery = await Gallery.find(tenantFilter(req)).sort({ createdAt: -1 });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare uploadGalleryImage for use by the surrounding module or function.
export const uploadGalleryImage = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.file) and run the matching branch.
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, image: { url: req.file.path, publicId: req.file.filename } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare createAdminGallery for use by the surrounding module or function.
export const createAdminGallery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { title, category, featured, active, imageUrl, publicId } for use by the surrounding module or function.
    const { title, category, featured, active, imageUrl, publicId } = req.body;
    // Check the condition (!title?.trim()) and run the matching branch.
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });
    // Check the condition (!imageUrl?.trim()) and run the matching branch.
    if (!imageUrl?.trim()) return res.status(400).json({ success: false, message: "Image URL is required" });

    // Declare item for use by the surrounding module or function.
    const item = await Gallery.create({
      tenantId,
      title: title.trim(),
      category: category?.trim() || "Safari",
      featured: Boolean(featured),
      active: active !== false,
      image: { url: imageUrl.trim(), publicId: publicId || "" },
    });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, gallery: item });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updateAdminGallery for use by the surrounding module or function.
export const updateAdminGallery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare { title, category, featured, active, imageUrl, publicId } for use by the surrounding module or function.
    const { title, category, featured, active, imageUrl, publicId } = req.body;
    // Declare update for use by the surrounding module or function.
    const update = {
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(category !== undefined ? { category: String(category).trim() } : {}),
      ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    };
    // Check the condition (imageUrl) and run the matching branch.
    if (imageUrl) update.image = { url: String(imageUrl).trim(), publicId: publicId || "" };

    // Declare item for use by the surrounding module or function.
    const item = await Gallery.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      update,
      { new: true, runValidators: true }
    );
    // Check the condition (!item) and run the matching branch.
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, gallery: item });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteAdminGallery for use by the surrounding module or function.
export const deleteAdminGallery = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare item for use by the surrounding module or function.
    const item = await Gallery.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!item) and run the matching branch.
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
