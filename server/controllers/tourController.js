import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import { getSystemSettings } from "../services/settingsService.js";

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

export const getTours = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { page = 1, limit = 12, search, destination, category, featured } = req.query;
    const filter = mergeTenantFilter({ ...publicTourFilter });
    if (destination) filter.destination = destination;
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;
    const [tours, total] = await Promise.all([
      Tour.find(filter).populate("destination").sort({ featured: -1, popularity: -1, createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Tour.countDocuments(filter),
    ]);
    const data = tours.map(attachAvailability);
    return res.json({ success: true, data, tours: data, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) }, tenantId });
  } catch (error) { return next(error); }
};

export const getFeaturedTours = async (req, res, next) => {
  try {
    requireTenantId();
    const tours = await Tour.find(mergeTenantFilter({ ...publicTourFilter, featured: true }))
      .populate("destination").sort({ popularity: -1, createdAt: -1 }).limit(6).lean();
    return res.json({ success: true, data: tours.map(attachAvailability) });
  } catch (error) { return next(error); }
};

export const searchTours = async (req, res, next) => {
  try {
    requireTenantId();
    const { keyword, search, category, country, destination } = req.query;
    const filter = mergeTenantFilter({ ...publicTourFilter });
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
    return res.json({ success: true, count: tours.length, data: tours.map(attachAvailability) });
  } catch (error) { return next(error); }
};

export const getTourById = async (req, res, next) => {
  try {
    requireTenantId();
    const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id }))
      .populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.json({ success: true, data: attachAvailability(tour) });
  } catch (error) { return next(error); }
};

export const getTourBySlug = async (req, res, next) => {
  try {
    requireTenantId();
    const tour = await Tour.findOne(mergeTenantFilter({ slug: req.params.slug, ...publicTourFilter }))
      .populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.json({ success: true, data: attachAvailability(tour) });
  } catch (error) { return next(error); }
};

export const createTour = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const body = { ...(req.body || {}) };
    const required = ["title", "description", "destination", "country", "location", "date", "price"];
    const missing = required.filter((key) => body[key] === undefined || body[key] === null || String(body[key]).trim() === "");
    if (missing.length) return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
    const uploadedImages = Array.isArray(req.files) ? req.files.filter((file) => file?.path).map((file) => ({ url: file.path, publicId: file.filename || file.public_id || "" })) : [];
    if (uploadedImages.length) { body.featuredImage = uploadedImages[0]; body.gallery = uploadedImages; }
    body.tenantId = tenantId;
    body.price = Number(body.price);
    body.capacity = Number(body.capacity || 20);
    body.duration = String(body.duration || 1);
    body.status = body.status || "upcoming";
    body.published = body.published === undefined ? true : body.published;
    body.available = true;
    body.isDeleted = false;
    body.createdBy = req.user?._id || null;
    body.availabilitySettings = body.availabilitySettings || { totalSlots: body.capacity, bookedSlots: 0, waitlistEnabled: false };
    const tour = await Tour.create(body);
    const data = await Tour.findById(tour._id).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    return res.status(201).json({ success: true, message: "Tour created successfully", data });
  } catch (error) { return next(error); }
};

export const getManagerTours = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = mergeTenantFilter({ isDeleted: false });
    if (req.user?._id) filter.createdBy = req.user._id;
    const tours = await Tour.find(filter).populate("destination assignedGuide assignedDriver assignedVehicle").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: tours.length, data: tours.map(attachAvailability) });
  } catch (error) { return next(error); }
};

export const updateTour = async (req, res, next) => {
  try {
    requireTenantId();
    const updatePayload = { ...(req.body || {}) };
    if (Array.isArray(req.files) && req.files.length) {
      const images = req.files.filter((file) => file?.path).map((file) => ({ url: file.path, publicId: file.filename || file.public_id || "" }));
      if (images.length) { updatePayload.featuredImage = images[0]; updatePayload.gallery = images; }
    }
    delete updatePayload.tenantId;
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id }), updatePayload, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.json({ success: true, message: "Tour updated successfully", data: tour });
  } catch (error) { return next(error); }
};

export const deleteTour = async (req, res, next) => {
  try {
    requireTenantId();
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id }), { $set: { isDeleted: true, available: false, status: "cancelled", deletedAt: new Date(), deletedBy: req.user?._id || null } }, { new: true }).lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    return res.json({ success: true, message: "Tour deleted successfully", data: tour });
  } catch (error) { return next(error); }
};

export const assignVehicle = async (req, res, next) => {
  try {
    requireTenantId();
    const vehicleId = req.body?.vehicleId || req.body?.assignedVehicle || req.body?.vehicle;
    if (!vehicleId) return res.status(400).json({ success: false, message: "vehicleId is required" });
    const vehicle = await Vehicle.findOne(mergeTenantFilter({ _id: vehicleId, isDeleted: { $ne: true } }));
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    if (vehicle.status && !["available", "assigned"].includes(vehicle.status)) return res.status(400).json({ success: false, message: "Vehicle is not available" });
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id }), { $set: { assignedVehicle: vehicle._id, assignmentStatus: "assigned" } }, { new: true, runValidators: true }).populate("assignedVehicle").lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    await Vehicle.findOneAndUpdate(mergeTenantFilter({ _id: vehicle._id }), { $set: { status: "assigned", assignedTour: tour._id } });
    return res.json({ success: true, message: "Vehicle assigned successfully", data: tour });
  } catch (error) { return next(error); }
};

export const removeVehicle = async (req, res, next) => {
  try {
    requireTenantId();
    const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id }));
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    const vehicleId = tour.assignedVehicle;
    tour.assignedVehicle = null;
    tour.assignmentStatus = tour.assignedGuide || tour.assignedDriver ? "assigned" : "pending";
    await tour.save();
    if (vehicleId) await Vehicle.findOneAndUpdate(mergeTenantFilter({ _id: vehicleId }), { $set: { status: "available", assignedTour: null } });
    return res.json({ success: true, message: "Vehicle removed successfully", data: tour });
  } catch (error) { return next(error); }
};
