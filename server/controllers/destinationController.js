import { getTenantContext, mergeTenantFilter } from "../tenancy/context.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";

const publicDestinationFilter = { status: "active", active: true, isDeleted: false };
const publicTourFilter = {
  isDeleted: false,
  published: true,
  available: true,
  status: { $in: ["scheduled", "upcoming", "ongoing"] },
};
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parsePage = (value) => {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;
};
const parsePageSize = (value, fallback = 12) => {
  const size = Number(value);
  return Number.isSafeInteger(size) ? Math.min(Math.max(size, 1), 24) : fallback;
};

const withPublicDestinationContext = async (callback) => {
  const context = getTenantContext();
  if (context.bypass === true) return callback(true);
  return callback(false);
};

export const getDestinations = async (req, res, next) => {
  try {
    return await withPublicDestinationContext(async (platformWide) => {
      const { page = 1, limit = 12, search, country, featured } = req.query;
      const currentPage = parsePage(page);
      const pageSize = parsePageSize(limit);
      const skip = (currentPage - 1) * pageSize;
      const filter = platformWide ? { ...publicDestinationFilter } : mergeTenantFilter({ ...publicDestinationFilter });
      if (country) filter.country = country;
      if (featured === "true") filter.featured = true;
      if (typeof search === "string" && search.trim()) {
        const keyword = escapeRegex(search.trim().slice(0, 120));
        filter.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { slug: { $regex: keyword, $options: "i" } },
          { country: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      }
      const [destinations, total] = await Promise.all([
        Destination.find(filter).select("name slug description shortDescription country city region images featured tenantId").slice("images", 1).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        Destination.countDocuments(filter),
      ]);
      return res.status(200).json({
        success: true,
        count: destinations.length,
        pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize },
        data: destinations,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getDestination = async (req, res, next) => {
  try {
    return await withPublicDestinationContext(async (platformWide) => {
      const slug = req.params.slug?.trim().toLowerCase();
      if (!slug) return res.status(400).json({ success: false, message: "Destination slug is required." });
      const destinationFilter = platformWide
        ? { slug, ...publicDestinationFilter }
        : mergeTenantFilter({ slug, ...publicDestinationFilter });
      let destination = await Destination.findOne(destinationFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).lean();

      // Public catalogue links may use human-friendly canonical slugs even when
      // a demo/tenant seed uses tenant-scoped slugs such as
      // "test-hussein-maasai-mara". Resolve a canonical slug by matching the
      // destination name without weakening tenant isolation. Exact slug remains
      // the first choice, so normal production records are unaffected.
      if (!destination) {
        const canonicalName = slug.replace(/-/g, " ").trim();
        const aliases = {
          "diani beach": ["diani beach", "diani"],
          "nairobi": ["nairobi"],
          "nairobi national park": ["nairobi national park", "nairobi"],
        };
        const candidates = aliases[canonicalName] || [canonicalName];
        const namePatterns = candidates.map((candidate) => candidate.split(" ").filter(Boolean).join(".*"));
        const nameFilter = platformWide
          ? { ...publicDestinationFilter, $or: namePatterns.map((pattern) => ({ name: { $regex: pattern, $options: "i" } })) }
          : mergeTenantFilter({ ...publicDestinationFilter, $or: namePatterns.map((pattern) => ({ name: { $regex: pattern, $options: "i" } })) });
        destination = await Destination.findOne(nameFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).sort({ createdAt: -1 }).lean();
      }
      if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });

      const tourFilter = platformWide
        ? { destination: destination._id, ...publicTourFilter }
        : mergeTenantFilter({ destination: destination._id, ...publicTourFilter });
      const relatedFilter = platformWide
        ? { _id: { $ne: destination._id }, country: destination.country, ...publicDestinationFilter }
        : mergeTenantFilter({ _id: { $ne: destination._id }, country: destination.country, ...publicDestinationFilter });
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

      destination.tours = tours;
      return res.status(200).json({ success: true, data: { destination, relatedDestinations } });
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedDestinations = async (req, res, next) => {
  try {
    return await withPublicDestinationContext(async (platformWide) => {
      const filter = platformWide
        ? { ...publicDestinationFilter, featured: true }
        : mergeTenantFilter({ ...publicDestinationFilter, featured: true });
      const destinations = await Destination.find(filter)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      return res.status(200).json({ success: true, count: destinations.length, data: destinations });
    });
  } catch (error) {
    next(error);
  }
};
