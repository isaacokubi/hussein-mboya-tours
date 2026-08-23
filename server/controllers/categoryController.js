import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import TourCategory from "../models/TourCategory.js";

export const getCategories = async (req, res, next) => {
  try {
    requireTenantId();
    const categories = await TourCategory.find({ ...tenantFilter(req), active: true }).sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (req, res, next) => {
  try {
    requireTenantId();
    const categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { name, slug, icon, description, image, active } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!description?.trim()) return res.status(400).json({ success: false, message: "Description is required" });

    const normalizedSlug = (slug || name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await TourCategory.create({
      tenantId,
      name: name.trim(),
      slug: normalizedSlug,
      icon: icon?.trim() || "Map",
      description: description.trim(),
      image: image?.trim() || "",
      active: active !== false,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" });
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    requireTenantId();
    const { name, slug, icon, description, image, active } = req.body;
    const update = {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(slug !== undefined ? { slug: String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}),
      ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(image !== undefined ? { image: String(image).trim() } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    };

    const category = await TourCategory.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      update,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" });
    res.json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" });
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    requireTenantId();
    const category = await TourCategory.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" });
    res.json({ success: true, message: "Travel experience deleted" });
  } catch (error) {
    next(error);
  }
};

export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });
