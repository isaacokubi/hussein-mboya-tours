/**
 * Purpose: category Controller HTTP controller. Main declarations: getCategories, getAdminCategories, createCategory, updateCategory, deleteCategory.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/TourCategory.js so this module can use its exported dependencies.
import TourCategory from "../models/TourCategory.js";

// Declare DEFAULT_CATEGORIES for use by the surrounding module or function.
const DEFAULT_CATEGORIES = [
  { name: "Safari", slug: "safari", icon: "Map", description: "Wildlife safaris, game drives and national park experiences." },
  { name: "Beach", slug: "beach", icon: "Waves", description: "Beach holidays, coastal escapes and island experiences." },
  { name: "Mountain", slug: "mountain", icon: "Mountain", description: "Mountain climbing, hiking and highland adventures." },
  { name: "Culture", slug: "culture", icon: "Landmark", description: "Cultural tours, heritage sites and authentic local experiences." },
];

// Declare getCategories for use by the surrounding module or function.
export const getCategories = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { requireTenantId(); const categories = await TourCategory.find({ ...tenantFilter(req), active: true }).sort({ createdAt: -1 }); res.json({ success: true, categories }); } catch (error) { next(error); }
};

// Declare getAdminCategories for use by the surrounding module or function.
export const getAdminCategories = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare categories for use by the surrounding module or function.
    let categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });
    // Check the condition (categories.length === 0) and run the matching branch.
    if (categories.length === 0) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        await TourCategory.insertMany(DEFAULT_CATEGORIES.map((category) => ({ ...category, tenantId, active: true })), { ordered: false });
        // Perform the side effect or state update expressed on the following line.
        categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });
      } catch (seedError) {
        // Check the condition (seedError?.code !== 11000) and run the matching branch.
        if (seedError?.code !== 11000) throw seedError;
        // Perform the side effect or state update expressed on the following line.
        categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });
      }
    }
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, categories });
  } catch (error) { next(error); }
};

// Declare createCategory for use by the surrounding module or function.
export const createCategory = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { name, slug, icon, description, image, active } for use by the surrounding module or function.
    const { name, slug, icon, description, image, active } = req.body;
    // Check the condition (!name?.trim()) and run the matching branch.
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    // Check the condition (!description?.trim()) and run the matching branch.
    if (!description?.trim()) return res.status(400).json({ success: false, message: "Description is required" });
    // Declare normalizedSlug for use by the surrounding module or function.
    const normalizedSlug = (slug || name).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    // Declare category for use by the surrounding module or function.
    const category = await TourCategory.create({ tenantId, name: name.trim(), slug: normalizedSlug, icon: icon?.trim() || "Map", description: description.trim(), image: image?.trim() || "", active: active !== false });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, category });
  } catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }
};

// Declare updateCategory for use by the surrounding module or function.
export const updateCategory = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare { name, slug, icon, description, image, active } for use by the surrounding module or function.
    const { name, slug, icon, description, image, active } = req.body;
    // Declare update for use by the surrounding module or function.
    const update = {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(slug !== undefined ? { slug: String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}),
      ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(image !== undefined ? { image: String(image).trim() } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    };
    // Declare category for use by the surrounding module or function.
    const category = await TourCategory.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true });
    // Check the condition (!category) and run the matching branch.
    if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, category });
  } catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }
};

// Declare deleteCategory for use by the surrounding module or function.
export const deleteCategory = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { requireTenantId(); const category = await TourCategory.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id })); if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" }); res.json({ success: true, message: "Travel experience deleted" }); } catch (error) { next(error); }
};
// Declare healthCheck for use by the surrounding module or function.
export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });
