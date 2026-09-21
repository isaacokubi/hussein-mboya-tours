import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Destination from "../models/Destination.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

const ACTIVE_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];
const MUTABLE_FIELDS = ["title","description","shortDescription","slug","tags","category","destination","country","location","meetingPoint","coordinates","duration","durationDays","durationDetails","date","startDate","endDate","capacity","price","agentPrice","discount","discountPrice","pricingRules","depositType","depositRequired","taxEnabled","taxCategory","taxMode","taxRate","highlights","inclusions","exclusions","languages","minimumAge","maximumAge","difficulty","itinerary","availability","availabilitySettings","cancellationPolicy","bookingDeadline","instantBooking","featured","available","published","status","seo"];

const parseDuration = (value) => {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const days = Number(match?.[0]);
  if (!Number.isFinite(days) || days < 1 || days > 365) throw Object.assign(new Error("Duration must be a whole number of days between 1 and 365."), { status: 400 });
  return Math.floor(days);
};

const tourWindow = (tour) => {
  const start = new Date(tour.startDate || tour.date);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.max(Number(tour.durationDays || tour.durationDetails?.days || tour.duration || 1), 1);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return { start, end };
};

const overlaps = (a, b) => {
  const left = tourWindow(a); const right = tourWindow(b);
  return Boolean(left && right && left.start < right.end && right.start < left.end);
};

const getResource = async (Model, id, filter, session) => {
  if (!id) return null;
  const doc = await Model.findOne(mergeTenantFilter(filter)).session(session);
  if (!doc) throw Object.assign(new Error("Selected resource does not belong to this tenant or is inactive."), { status: 400 });
  return doc;
};

const assertAssignments = async ({ guideId, driverId, vehicleId, tour, session }) => {
  const guide = guideId ? await getResource(Staff, guideId, { _id: guideId, position: { $in: ["guide","tour_guide","tourguide"] }, isActive: true, isDeleted: { $ne: true } }, session) : null;
  const driver = driverId ? await getResource(Staff, driverId, { _id: driverId, position: "driver", isActive: true, isDeleted: { $ne: true } }, session) : null;
  const vehicle = vehicleId ? await getResource(Vehicle, vehicleId, { _id: vehicleId, isActive: true, isDeleted: { $ne: true } }, session) : null;
  if (guide && guide.availability !== "available") throw Object.assign(new Error("Selected guide is unavailable."), { status: 409 });
  if (driver && driver.availability !== "available") throw Object.assign(new Error("Selected driver is unavailable."), { status: 409 });
  if (vehicle && vehicle.status !== "available") throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });
  for (const [field, id] of [["assignedGuide", guide?._id], ["assignedDriver", driver?._id], ["assignedVehicle", vehicle?._id]]) {
    if (!id) continue;
    const conflicts = await Tour.find(mergeTenantFilter({ _id: { $ne: tour._id }, isDeleted: { $ne: true }, status: { $in: ACTIVE_STATUSES }, [field]: id })).select("_id date startDate duration durationDays durationDetails").session(session).lean();
    if (conflicts.some((candidate) => overlaps(tour, candidate))) {
      throw Object.assign(new Error(`Selected ${field.replace("assigned","").toLowerCase()} is already assigned to another overlapping tour.`), { status: 409, code: "RESOURCE_DOUBLE_BOOKED" });
    }
  }
  return { guide, driver, vehicle };
};

const applyResourceState = async ({ tour, resources, session }) => {
  const { guide, driver, vehicle } = resources;
  if (guide) { guide.availability = "busy"; guide.assignedTours = [...new Set([...(guide.assignedTours || []).map(String), String(tour._id)])]; await guide.save({ session }); }
  if (driver) { driver.availability = "busy"; driver.assignedTours = [...new Set([...(driver.assignedTours || []).map(String), String(tour._id)])]; await driver.save({ session }); }
  if (vehicle) { vehicle.status = "assigned"; vehicle.assignedTour = tour._id; await vehicle.save({ session }); }
};

const normalizedPayload = (body, files, userId, existing = null) => {
  const source = existing ? { ...existing.toObject(), ...body } : { ...body };
  const payload = {};
  for (const field of MUTABLE_FIELDS) if (Object.prototype.hasOwnProperty.call(source, field)) payload[field] = source[field];
  if (!payload.title?.trim() || !payload.description?.trim() || !payload.destination || !payload.country?.trim() || !payload.location?.trim()) throw Object.assign(new Error("Title, description, destination, country and location are required."), { status: 400 });
  if (!payload.date && !payload.startDate) throw Object.assign(new Error("A tour date or startDate is required."), { status: 400 });
  if (payload.price === undefined || !Number.isFinite(Number(payload.price)) || Number(payload.price) < 0) throw Object.assign(new Error("A valid non-negative price is required."), { status: 400 });
  const durationDays = parseDuration(payload.durationDays ?? payload.durationDetails?.days ?? payload.duration ?? 1);
  payload.durationDays = durationDays;
  payload.durationDetails = { ...(payload.durationDetails || {}), days: durationDays };
  payload.duration = String(durationDays);
  payload.price = Number(payload.price);
  payload.capacity = Math.max(1, Number(payload.capacity || 20));
  payload.discount = Math.min(100, Math.max(0, Number(payload.discount || 0)));
  payload.depositType = String(payload.depositType || "fixed").toLowerCase();
  if (!["fixed","percentage"].includes(payload.depositType)) throw Object.assign(new Error("depositType must be fixed or percentage."), { status: 400 });
  if (files?.length) {
    const images = files.filter((file) => file?.path).map((file) => ({ url: file.path, publicId: file.filename || file.public_id || "" }));
    if (images.length) { payload.featuredImage = images[0]; payload.gallery = images.slice(1); }
  }
  if (!existing) {
    payload.status = payload.status || "upcoming";
    payload.published = payload.published === undefined ? false : Boolean(payload.published);
    payload.available = payload.available !== false;
    payload.availabilitySettings = payload.availabilitySettings || { totalSlots: payload.capacity, bookedSlots: 0, waitlistEnabled: false };
    payload.createdBy = userId || null;
    payload.isDeleted = false;
  }
  return payload;
};

export const createTour = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);
      const destination = await Destination.findOne(mergeTenantFilter({ _id: payload.destination, isDeleted: { $ne: true } })).session(session);
      if (!destination) throw Object.assign(new Error("The selected destination does not belong to this tenant."), { status: 400 });
      const resources = await assertAssignments({
        guideId: req.body?.assignedGuide || req.body?.guide || null,
        driverId: req.body?.assignedDriver || req.body?.driver || null,
        vehicleId: req.body?.assignedVehicle || req.body?.vehicle || null,
        tour: { ...payload, _id: new mongoose.Types.ObjectId() },
        session,
      });
      payload.assignedGuide = resources.guide?._id || null;
      payload.assignedDriver = resources.driver?._id || null;
      payload.assignedVehicle = resources.vehicle?._id || null;
      payload.assignmentStatus = resources.guide || resources.driver || resources.vehicle ? "assigned" : "pending";
      [created] = await Tour.create([payload], { session });
      await applyResourceState({ tour: created, resources, session });
    });
    const tour = await Tour.findOne(mergeTenantFilter({ _id: created._id })).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    return res.status(201).json({ success: true, message: "Tour created successfully.", data: tour, tour });
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

export const updateTour = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));
    if (!existing) return res.status(404).json({ success: false, message: "Tour not found." });
    if (["assignedGuide","assignedDriver","assignedVehicle","guide","driver","vehicle"].some((key) => req.body?.[key] !== undefined)) return res.status(400).json({ success: false, message: "Use the dedicated tour resource assignment endpoint to change guides, drivers or vehicles." });
    const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);
    delete payload.tenantId;
    delete payload.createdBy;
    const updated = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: existing._id }), payload, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    return res.json({ success: true, message: "Tour updated successfully.", data: updated, tour: updated });
  } catch (error) { return next(error); }
};

export const deleteTour = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });
    return res.json({ success: true, message: "Tour deleted after cancelling/reconciling active bookings.", data: result.tour, bookingsAffected: result.bookingsAffected });
  } catch (error) { return next(error); }
};

export const setPublication = async (req, res, next) => {
  requireTenantId();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    const published = req.body?.published;
    if (typeof published !== "boolean" && !["true","false"].includes(String(published))) return res.status(400).json({ success: false, message: "published must be a boolean." });
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });
    return res.json({ success: true, message: `Tour ${tour.published ? "published" : "unpublished"} successfully.`, data: tour, tour });
  } catch (error) { return next(error); }
};
