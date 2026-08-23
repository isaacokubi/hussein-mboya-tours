import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import HeroSlide from "../models/HeroSlide.js";

export const getHeroSlides = async (req, res) => {
  try {
    requireTenantId();
    const slides = await HeroSlide.find({ ...tenantFilter(req), active: true }).sort({ order: 1, createdAt: 1 }).lean();
    return res.status(200).json({ success: true, slides });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });
