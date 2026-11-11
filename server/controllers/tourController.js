/**
 * Purpose: tour Controller HTTP controller. Main declarations: attachAvailability, withPublicTourContext, normalizeDestinationId, categoryFilter, escapeRegex.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getTenantContext, mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

// Declare publicTourFilter for use by the surrounding module or function.
const publicTourFilter = {
  available: true,
  isDeleted: false,
  published: true,
  status: { $in: ["scheduled", "upcoming", "ongoing"] },
};

// Declare attachAvailability for use by the surrounding module or function.
const attachAvailability = (tourLike) => {
  // Declare totalSlots for use by the surrounding module or function.
  const totalSlots = Number(tourLike?.availabilitySettings?.totalSlots ?? tourLike?.capacity ?? 0);
  // Declare bookedSlots for use by the surrounding module or function.
  const bookedSlots = Math.max(0, Number(tourLike?.availabilitySettings?.bookedSlots ?? 0));
  // Declare availableSlots for use by the surrounding module or function.
  const availableSlots = Math.max(totalSlots - bookedSlots, 0);
  // Return the object assembled below to the caller.
  return { ...tourLike, totalSlots, bookedSlots, availableSlots, isFull: availableSlots === 0 };
};

// Tenant-facing tour reads fail closed when no tenant is resolved.
// Only an intentional SuperAdmin/platform bypass may read globally.
// Declare withPublicTourContext for use by the surrounding module or function.
const withPublicTourContext = async (callback) => {
  // Declare context for use by the surrounding module or function.
  const context = getTenantContext();
  // Check the condition (context.bypass === true) and run the matching branch.
  if (context.bypass === true) return callback(true);
  // Return the result of callback() to the caller.
  return callback(false);
};

// Declare normalizeDestinationId for use by the surrounding module or function.
const normalizeDestinationId = (value) => {
  // Check the condition (!value || !String(value).trim()) and run the matching branch.
  if (!value || !String(value).trim()) return null;
  // Return the result of String(value).trim() to the caller.
  return String(value).trim();
};

// Declare categoryFilter for use by the surrounding module or function.
export const categoryFilter = (value) => ({
  $regex: `^${String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  $options: "i",
});

// Declare escapeRegex for use by the surrounding module or function.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Declare publicListFields for use by the surrounding module or function.
const publicListFields = "title slug description shortDescription price discount currency duration durationDays durationDetails category country location featuredImage images gallery rating averageRating capacity availabilitySettings destination tenantId featured popularity createdAt startDate endDate";
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

// Declare ensureDestination for use by the surrounding module or function.
const ensureDestination = async (destinationId, tenantId) => {
  // Declare id for use by the surrounding module or function.
  const id = normalizeDestinationId(destinationId);
  // Check the condition (!id) and run the matching branch.
  if (!id) return null;
  // Declare filter for use by the surrounding module or function.
  const filter = tenantId ? mergeTenantFilter({ _id: id }) : { _id: id };
  // Return the result of Destination.findOne(filter).lean() to the caller.
  return Destination.findOne(filter).lean();
};

// Declare hasRealTourImage for use by the surrounding module or function.
const hasRealTourImage = (tour) => {
  // Declare values for use by the surrounding module or function.
  const values = [tour?.featuredImage, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])];
  // Return the result of values.some() to the caller.
  return values.some((item) => {
    // Declare url for use by the surrounding module or function.
    const url = typeof item === "string" ? item : item?.url;
    // Check the condition (!url) and run the matching branch.
    if (!url) return false;
    // Declare normalized for use by the surrounding module or function.
    const normalized = String(url).toLowerCase();
    // Return the expression shown below to the caller.
    return !normalized.includes("image-placeholder") && !normalized.endsWith("/hero1.jpeg");
  });
};

// Declare getTours for use by the surrounding module or function.
export const getTours = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicTourContext() operation to the caller.
    return await withPublicTourContext(async (platformWide) => {
      // Declare { page = 1, limit = 12, search, destination, category, featured, duration, travellers, sort } for use by the surrounding module or function.
      const { page = 1, limit = 12, search, destination, category, featured, duration, travellers, sort } = req.query;
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });
      // Check the condition (destination) and run the matching branch.
      if (destination) filter.destination = destination;
      // Check the condition (category) and run the matching branch.
      if (category) filter.category = categoryFilter(category);
      // Check the condition (featured === "true") and run the matching branch.
      if (featured === "true") filter.featured = true;
      // Check the condition (typeof search === "string" && search.trim()) and run the matching branch.
      if (typeof search === "string" && search.trim()) {
        // Declare keyword for use by the surrounding module or function.
        const keyword = escapeRegex(search.trim().slice(0, 120));
        // Perform the side effect or state update expressed on the following line.
        filter.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { location: { $regex: keyword, $options: "i" } },
        ];
      }
      // Check the condition (duration === "1-3") and run the matching branch.
      if (duration === "1-3") filter.durationDays = { $gte: 1, $lte: 3 };
      else if (duration === "4-6") filter.durationDays = { $gte: 4, $lte: 6 };
      else if (duration === "7+") filter.durationDays = { $gte: 7 };
      // Declare partySize for use by the surrounding module or function.
      const partySize = Number(travellers);
      // Check the condition (Number.isInteger(partySize) && partySize > 0 && partySize <= 100) and run the matching branch.
      if (Number.isInteger(partySize) && partySize > 0 && partySize <= 100) {
        // Perform the side effect or state update expressed on the following line.
        filter.$and = [...(filter.$and || []), { $or: [{ capacity: { $gte: partySize } }, { "availabilitySettings.totalSlots": { $gte: partySize } }] }];
      }
      // Declare currentPage for use by the surrounding module or function.
      const currentPage = parsePage(page);
      // Declare pageSize for use by the surrounding module or function.
      const pageSize = parsePageSize(limit);
      // Declare skip for use by the surrounding module or function.
      const skip = (currentPage - 1) * pageSize;
      // Declare sortBy for use by the surrounding module or function.
      const sortBy = sort === "price-asc" ? { price: 1, createdAt: -1 }
        : sort === "price-desc" ? { price: -1, createdAt: -1 }
          : sort === "newest" ? { createdAt: -1 }
            : { featured: -1, popularity: -1, createdAt: -1 };
      // Declare [tours, total, settings] for use by the surrounding module or function.
      const [tours, total, settings] = await Promise.all([
        Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort(sortBy).skip(skip).limit(pageSize).lean(),
        Tour.countDocuments(filter),
        getSystemSettings(),
      ]);
      // Declare data for use by the surrounding module or function.
      const data = tours.map((tour) => ({ ...attachAvailability(tour), currency: settings?.currency || "KES", currencySymbol: settings?.currencySymbol || "KSh", hasOwnImage: hasRealTourImage(tour) }));
      // Return the result of res.json() to the caller.
      return res.json({ success: true, data, tours: data, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
    });
  } catch (error) { return next(error); }
};

// Declare getFeaturedTours for use by the surrounding module or function.
export const getFeaturedTours = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicTourContext() operation to the caller.
    return await withPublicTourContext(async (platformWide) => {
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { ...publicTourFilter, featured: true } : mergeTenantFilter({ ...publicTourFilter, featured: true });
      // Declare tours for use by the surrounding module or function.
      const tours = await Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort({ popularity: -1, createdAt: -1 }).limit(6).lean();
      // Return the result of res.json() to the caller.
      return res.json({ success: true, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
    });
  } catch (error) { return next(error); }
};

// Declare searchTours for use by the surrounding module or function.
export const searchTours = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicTourContext() operation to the caller.
    return await withPublicTourContext(async (platformWide) => {
      // Declare { keyword, search, category, country, destination, page = 1, limit = 12 } for use by the surrounding module or function.
      const { keyword, search, category, country, destination, page = 1, limit = 12 } = req.query;
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });
      // Declare term for use by the surrounding module or function.
      const term = keyword || search;
      // Check the condition (term) and run the matching branch.
      if (term) filter.$or = [
        { title: { $regex: escapeRegex(String(term).slice(0, 120)), $options: "i" } },
        { description: { $regex: escapeRegex(String(term).slice(0, 120)), $options: "i" } },
        { location: { $regex: escapeRegex(String(term).slice(0, 120)), $options: "i" } },
      ];
      // Check the condition (category) and run the matching branch.
      if (category) filter.category = categoryFilter(category);
      // Check the condition (country) and run the matching branch.
      if (country) filter.country = country;
      // Check the condition (destination) and run the matching branch.
      if (destination) filter.destination = destination;
      // Declare currentPage for use by the surrounding module or function.
      const currentPage = parsePage(page);
      // Declare pageSize for use by the surrounding module or function.
      const pageSize = parsePageSize(limit);
      // Declare [tours, total] for use by the surrounding module or function.
      const [tours, total] = await Promise.all([
        Tour.find(filter).select(publicListFields).slice("images", 1).slice("gallery", 1).populate({ path: "destination", select: "name slug country" }).sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
        Tour.countDocuments(filter),
      ]);
      // Return the result of res.json() to the caller.
      return res.json({ success: true, count: tours.length, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) }, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
    });
  } catch (error) { return next(error); }
};

// Declare getTourById for use by the surrounding module or function.
export const getTourById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicTourContext() operation to the caller.
    return await withPublicTourContext(async (platformWide) => {
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { _id: req.params.id, ...publicTourFilter } : mergeTenantFilter({ _id: req.params.id, ...publicTourFilter });
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
      // Return the result of res.json() to the caller.
      return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });
    });
  } catch (error) { return next(error); }
};

// Declare getTourBySlug for use by the surrounding module or function.
export const getTourBySlug = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of withPublicTourContext() operation to the caller.
    return await withPublicTourContext(async (platformWide) => {
      // Declare slug for use by the surrounding module or function.
      const slug = String(req.params.slug || "").trim().toLowerCase();
      // Check the condition (!slug) and run the matching branch.
      if (!slug) return res.status(400).json({ success: false, message: "Tour slug is required" });
      // Declare filter for use by the surrounding module or function.
      const filter = platformWide ? { slug, ...publicTourFilter } : mergeTenantFilter({ slug, ...publicTourFilter });
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(filter).populate({ path: "destination", select: "name slug country" }).lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
      // Return the result of res.json() to the caller.
      return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });
    });
  } catch (error) { return next(error); }
};

// Declare getManagerTours for use by the surrounding module or function.
export const getManagerTours = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({ isDeleted: false });
    // Check the condition (req.user?._id) and run the matching branch.
    if (req.user?._id) filter.createdBy = req.user._id;
    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find(filter).populate("destination assignedGuide assignedDriver assignedVehicle").sort({ createdAt: -1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: tours.length, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
  } catch (error) { return next(error); }
};
