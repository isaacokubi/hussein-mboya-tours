/**
 * Purpose: destination Controller HTTP controller. Main declarations: escapeRegex, parsePage, parsePageSize, withPublicDestinationContext, getDestinations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getTenantContext, mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare publicDestinationFilter for use by the surrounding module or function.
const publicDestinationFilter = { status: "active", active: true, isDeleted: false };
// Declare publicTourFilter for use by the surrounding module or function.
const publicTourFilter = {
  isDeleted: false,
  published: true,
  available: true,
  status: { $in: ["scheduled", "upcoming", "ongoing"] },
};
// Declare escapeRegex for use by the surrounding module or function.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Declare parsePage for use by the surrounding module or function.
const parsePage = (value) => {
  // Declare page for use by the surrounding module or function.
  const page = Number(value);
  // Return the expression shown below to the caller.
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;
};
// Declare parsePageSize for use by the surrounding module or function.
const parsePageSize = (value, fallback = 12) => {
  // Declare size for use by the surrounding module or function.
  const size = Number(value);
  // Return the expression shown below to the caller.
  return Number.isSafeInteger(size) ? Math.min(Math.max(size, 1), 24) : fallback;
};

// Declare withPublicDestinationContext for use by the surrounding module or function.
const withPublicDestinationContext = async (callback) => {
  // Declare context for use by the surrounding module or function.
  const context = getTenantContext();
  // Check the condition (context.bypass === true) and run the matching branch.
  if (context.bypass === true) return callback(true);
  // Return the result of callback() to the caller.
  return callback(false);
};

// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicDestinationContext() operation to the caller.
    return await withPublicDestinationContext(async (platformWide) => {
      // Declare { page = 1, limit = 12, search, country, featured } for use by the surrounding module or function.
      const { page = 1, limit = 12, search, country, featured } = req.query;
      // Declare currentPage for use by the surrounding module or function.
      const currentPage = parsePage(page);
      // Declare pageSize for use by the surrounding module or function.
      const pageSize = parsePageSize(limit);
      // Declare skip for use by the surrounding module or function.
      const skip = (currentPage - 1) * pageSize;
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { ...publicDestinationFilter } : mergeTenantFilter({ ...publicDestinationFilter });
      // Check the condition (country) and run the matching branch.
      if (country) filter.country = country;
      // Check the condition (featured === "true") and run the matching branch.
      if (featured === "true") filter.featured = true;
      // Check the condition (typeof search === "string" && search.trim()) and run the matching branch.
      if (typeof search === "string" && search.trim()) {
        // Declare keyword for use by the surrounding module or function.
        const keyword = escapeRegex(search.trim().slice(0, 120));
        // Perform the side effect or state update expressed on the following line.
        filter.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { slug: { $regex: keyword, $options: "i" } },
          { country: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      }
      // Declare [destinations, total] for use by the surrounding module or function.
      const [destinations, total] = await Promise.all([
        Destination.find(filter).select("name slug description shortDescription country city region images featured tenantId").slice("images", 1).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        Destination.countDocuments(filter),
      ]);
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({
        success: true,
        count: destinations.length,
        pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize },
        data: destinations,
      });
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getDestination for use by the surrounding module or function.
export const getDestination = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicDestinationContext() operation to the caller.
    return await withPublicDestinationContext(async (platformWide) => {
      // Declare slug for use by the surrounding module or function.
      const slug = req.params.slug?.trim().toLowerCase();
      // Check the condition (!slug) and run the matching branch.
      if (!slug) return res.status(400).json({ success: false, message: "Destination slug is required." });
      // Declare destinationFilter for use by the surrounding module or function.
      const destinationFilter = platformWide
        ? { slug, ...publicDestinationFilter }
        : mergeTenantFilter({ slug, ...publicDestinationFilter });
      // Declare destination for use by the surrounding module or function.
      let destination = await Destination.findOne(destinationFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).lean();

      // Public catalogue links may use human-friendly canonical slugs even when
      // a demo/tenant seed uses tenant-scoped slugs such as
      // "test-hussein-maasai-mara". Resolve a canonical slug by matching the
      // destination name without weakening tenant isolation. Exact slug remains
      // the first choice, so normal production records are unaffected.
      // Check the condition (!destination) and run the matching branch.
      if (!destination) {
        // Declare canonicalName for use by the surrounding module or function.
        const canonicalName = slug.replace(/-/g, " ").trim();
        // Declare aliases for use by the surrounding module or function.
        const aliases = {
          "diani beach": ["diani beach", "diani"],
          "nairobi": ["nairobi"],
          "nairobi national park": ["nairobi national park", "nairobi"],
        };
        // Declare candidates for use by the surrounding module or function.
        const candidates = aliases[canonicalName] || [canonicalName];
        // Declare namePatterns for use by the surrounding module or function.
        const namePatterns = candidates.map((candidate) => candidate.split(" ").filter(Boolean).join(".*"));
        // Declare nameFilter for use by the surrounding module or function.
        const nameFilter = platformWide
          ? { ...publicDestinationFilter, $or: namePatterns.map((pattern) => ({ name: { $regex: pattern, $options: "i" } })) }
          : mergeTenantFilter({ ...publicDestinationFilter, $or: namePatterns.map((pattern) => ({ name: { $regex: pattern, $options: "i" } })) });
        // Perform the side effect or state update expressed on the following line.
        destination = await Destination.findOne(nameFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).sort({ createdAt: -1 }).lean();
      }
      // Check the condition (!destination) and run the matching branch.
      if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });

      // Declare tourFilter for use by the surrounding module or function.
      const tourFilter = platformWide
        ? { destination: destination._id, ...publicTourFilter }
        : mergeTenantFilter({ destination: destination._id, ...publicTourFilter });
      // Declare relatedFilter for use by the surrounding module or function.
      const relatedFilter = platformWide
        ? { _id: { $ne: destination._id }, country: destination.country, ...publicDestinationFilter }
        : mergeTenantFilter({ _id: { $ne: destination._id }, country: destination.country, ...publicDestinationFilter });
      // Declare [tours, relatedDestinations] for use by the surrounding module or function.
      const [tours, relatedDestinations] = await Promise.all([Tour.find(tourFilter)
        .select("title slug images featuredImage gallery price duration category destination tenantId startDate endDate")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .slice("images", 1)
        .slice("gallery", 1)
        .limit(24)
        .lean(), Destination.find(relatedFilter)
        .select("name slug images country featured")
        .slice("images", 1)
        .limit(4)
        .lean()]);

      // Perform the side effect or state update expressed on the following line.
      destination.tours = tours;
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, data: { destination, relatedDestinations } });
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getFeaturedDestinations for use by the surrounding module or function.
export const getFeaturedDestinations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicDestinationContext() operation to the caller.
    return await withPublicDestinationContext(async (platformWide) => {
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide
        ? { ...publicDestinationFilter, featured: true }
        : mergeTenantFilter({ ...publicDestinationFilter, featured: true });
      // Declare destinations for use by the surrounding module or function.
      const destinations = await Destination.find(filter)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, count: destinations.length, data: destinations });
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
