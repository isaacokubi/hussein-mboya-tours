import { getTenantContext, mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Vehicle from "../models/Vehicle.js";
import Staff from "../models/Staff.js";
import { getSystemSettings } from "../services/settingsService.js";
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

const publicTourFilter = {
  available: true,
  isDeleted: false,
  published: true,
  status: { $in: ["scheduled", "upcoming", "ongoing"] },
};

const attachAvailability = (tourLike) => {
  const totalSlots = Number(tourLike?.availabilitySettings?.totalSlots ?? tourLike?.capacity ?? 0);
  const bookedSlots = Math.max(0, Number(tourLike?.availabilitySettings?.bookedSlots ?? 0));
  const availableSlots = Math.max(totalSlots - bookedSlots, 0);
  return { ...tourLike, totalSlots, bookedSlots, availableSlots, isFull: availableSlots === 0 };
};

// Tenant-facing tour reads fail closed when no tenant is resolved.
// Only an intentional SuperAdmin/platform bypass may read globally.
const withPublicTourContext = async (callback) => {
  const context = getTenantContext();
  if (context.bypass === true) return callback(true);
  return callback(false);
};

const normalizeDestinationId = (value) => {
  if (!value || !String(value).trim()) return null;
  return String(value).trim();
};

const ensureDestination = async (destinationId, tenantId) => {
  const id = normalizeDestinationId(destinationId);
  if (!id) return null;
  const filter = tenantId ? mergeTenantFilter({ _id: id }) : { _id: id };
  return Destination.findOne(filter).lean();
};

const hasRealTourImage = (tour) => {
  const values = [tour?.featuredImage, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])];
  return values.some((item) => {
    const url = typeof item === "string" ? item : item?.url;
    if (!url) return false;
    const normalized = String(url).toLowerCase();
    return !normalized.includes("image-placeholder") && !normalized.endsWith("/hero1.jpeg");
  });
};

export const getTours = async (req, res, next) => {
  try {
    return await withPublicTourContext(async (platformWide) => {
      const { page = 1, limit = 12, search, destination, category, featured } = req.query;
      const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });
      if (destination) filter.destination = destination;
      if (category) filter.category = category;
      if (featured === "true") filter.featured = true;
      if (search?.trim()) {
        const keyword = search.trim();
        filter.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { location: { $regex: keyword, $options: "i" } },
        ];
      }
      const currentPage = Math.max(Number(page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 100);
      const skip = (currentPage - 1) * pageSize;
      const [tours, total, settings] = await Promise.all([
        Tour.find(filter).populate("destination").sort({ featured: -1, popularity: -1, createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        Tour.countDocuments(filter),
        getSystemSettings(),
      ]);
      const data = tours.map((tour) => ({ ...attachAvailability(tour), currency: settings?.currency || "KES", currencySymbol: settings?.currencySymbol || "KSh", hasOwnImage: hasRealTourImage(tour) }));
      return res.json({ success: true, data, tours: data, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
    });
  } catch (error) { return next(error); }
};

export const getFeaturedTours = async (req, res, next) => {
  try {
    return await withPublicTourContext(async (platformWide) => {
      const filter = platformWide ? { ...publicTourFilter, featured: true } : mergeTenantFilter({ ...publicTourFilter, featured: true });
      const tours = await Tour.find(filter).populate("destination").sort({ popularity: -1, createdAt: -1 }).limit(6).lean();
      return res.json({ success: true, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
    });
  } catch (error) { return next(error); }
};

export const searchTours = async (req, res, next) => {
  try {
    return await withPublicTourContext(async (platformWide) => {
      const { keyword, search, category, country, destination } = req.query;
      const filter = platformWide ? { ...publicTourFilter } : mergeTenantFilter({ ...publicTourFilter });
      const term = keyword || search;
      if (term) filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ];
      if (category) filter.category = category;
      if (country) filter.country = country;
      if (destination) filter.destination = destination;
      const tours = await Tour.find(filter).populate("destination").sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: tours.length, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
    });
  } catch (error) { return next(error); }
};

export const getTourById = async (req, res, next) => {
  try {
    return await withPublicTourContext(async (platformWide) => {
      const filter = platformWide ? { _id: req.params.id, ...publicTourFilter } : mergeTenantFilter({ _id: req.params.id, ...publicTourFilter });
      const tour = await Tour.findOne(filter).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
      return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });
    });
  } catch (error) { return next(error); }
};

export const getTourBySlug = async (req, res, next) => {
  try {
    return await withPublicTourContext(async (platformWide) => {
      const slug = String(req.params.slug || "").trim().toLowerCase();
      if (!slug) return res.status(400).json({ success: false, message: "Tour slug is required" });
      const filter = platformWide ? { slug, ...publicTourFilter } : mergeTenantFilter({ slug, ...publicTourFilter });
      const tour = await Tour.findOne(filter).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
      return res.json({ success: true, data: { ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) } });
    });
  } catch (error) { return next(error); }
};

export const getManagerTours = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = mergeTenantFilter({ isDeleted: false });
    if (req.user?._id) filter.createdBy = req.user._id;
    const tours = await Tour.find(filter).populate("destination assignedGuide assignedDriver assignedVehicle").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: tours.length, data: tours.map((tour) => ({ ...attachAvailability(tour), hasOwnImage: hasRealTourImage(tour) })) });
  } catch (error) { return next(error); }
};

