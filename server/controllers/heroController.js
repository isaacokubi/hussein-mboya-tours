/**
 * Purpose: hero Controller HTTP controller. Main declarations: getHeroSlides, healthCheck.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/HeroSlide.js so this module can use its exported dependencies.
import HeroSlide from "../models/HeroSlide.js";

// Declare getHeroSlides for use by the surrounding module or function.
export const getHeroSlides = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare slides for use by the surrounding module or function.
    const slides = await HeroSlide.find({ ...tenantFilter(req), active: true }).sort({ order: 1, createdAt: 1 }).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, slides });
  } catch (error) {
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare healthCheck for use by the surrounding module or function.
export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });
