/**
 * Purpose: tour Crud Controller HTTP controller. Main declarations: parseDuration, tourWindow, overlaps, getResource, assertAssignments.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

// Declare ACTIVE_STATUSES for use by the surrounding module or function.
const ACTIVE_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];
// Declare MUTABLE_FIELDS for use by the surrounding module or function.
const MUTABLE_FIELDS = ["title","description","shortDescription","slug","tags","category","destination","country","location","meetingPoint","coordinates","duration","durationDays","durationDetails","date","startDate","endDate","capacity","price","agentPrice","discount","discountPrice","pricingRules","depositType","depositRequired","taxEnabled","taxCategory","taxMode","taxRate","highlights","inclusions","exclusions","languages","minimumAge","maximumAge","difficulty","itinerary","availability","availabilitySettings","cancellationPolicy","bookingDeadline","instantBooking","featured","available","published","status","seo"];

// Declare parseDuration for use by the surrounding module or function.
const parseDuration = (value) => {
  // Declare match for use by the surrounding module or function.
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  // Declare days for use by the surrounding module or function.
  const days = Number(match?.[0]);
  // Check the condition (!Number.isFinite(days) || days < 1 || days > 365) and run the matching branch.
  if (!Number.isFinite(days) || days < 1 || days > 365) throw Object.assign(new Error("Duration must be a whole number of days between 1 and 365."), { status: 400 });
  // Return the result of Math.floor() to the caller.
  return Math.floor(days);
};

// Declare tourWindow for use by the surrounding module or function.
const tourWindow = (tour) => {
  // Declare start for use by the surrounding module or function.
  const start = new Date(tour.startDate || tour.date);
  // Check the condition (Number.isNaN(start.getTime())) and run the matching branch.
  if (Number.isNaN(start.getTime())) return null;
  // Declare days for use by the surrounding module or function.
  const days = Math.max(Number(tour.durationDays || tour.durationDetails?.days || tour.duration || 1), 1);
  // Declare end for use by the surrounding module or function.
  const end = new Date(start);
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + days);
  // Return the object assembled below to the caller.
  return { start, end };
};

// Declare overlaps for use by the surrounding module or function.
const overlaps = (a, b) => {
  // Declare left for use by the surrounding module or function.
  const left = tourWindow(a); const right = tourWindow(b);
  // Return the result of Boolean() to the caller.
  return Boolean(left && right && left.start < right.end && right.start < left.end);
};

// Declare getResource for use by the surrounding module or function.
const getResource = async (Model, id, filter, session) => {
  // Check the condition (!id) and run the matching branch.
  if (!id) return null;
  // Declare doc for use by the surrounding module or function.
  const doc = await Model.findOne(mergeTenantFilter(filter)).session(session);
  // Check the condition (!doc) and run the matching branch.
  if (!doc) throw Object.assign(new Error("Selected resource does not belong to this tenant or is inactive."), { status: 400 });
  // Return the value of doc to the caller.
  return doc;
};

// Declare assertAssignments for use by the surrounding module or function.
const assertAssignments = async ({ guideId, driverId, vehicleId, tour, session }) => {
  // Declare guide for use by the surrounding module or function.
  const guide = guideId ? await getResource(Staff, guideId, { _id: guideId, position: { $in: ["guide","tour_guide","tourguide"] }, isActive: true, isDeleted: { $ne: true } }, session) : null;
  // Declare driver for use by the surrounding module or function.
  const driver = driverId ? await getResource(Staff, driverId, { _id: driverId, position: "driver", isActive: true, isDeleted: { $ne: true } }, session) : null;
  // Declare vehicle for use by the surrounding module or function.
  const vehicle = vehicleId ? await getResource(Vehicle, vehicleId, { _id: vehicleId, isActive: true, isDeleted: { $ne: true } }, session) : null;
  // Check the condition (guide && guide.availability !== "available") and run the matching branch.
  if (guide && guide.availability !== "available") throw Object.assign(new Error("Selected guide is unavailable."), { status: 409 });
  // Check the condition (driver && driver.availability !== "available") and run the matching branch.
  if (driver && driver.availability !== "available") throw Object.assign(new Error("Selected driver is unavailable."), { status: 409 });
  // Check the condition (vehicle && vehicle.status !== "available") and run the matching branch.
  if (vehicle && vehicle.status !== "available") throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });
  // Repeat the enclosed work for each required iteration.
  for (const [field, id] of [["assignedGuide", guide?._id], ["assignedDriver", driver?._id], ["assignedVehicle", vehicle?._id]]) {
    // Check the condition (!id) and run the matching branch.
    if (!id) continue;
    // Declare conflicts for use by the surrounding module or function.
    const conflicts = await Tour.find(mergeTenantFilter({ _id: { $ne: tour._id }, isDeleted: { $ne: true }, status: { $in: ACTIVE_STATUSES }, [field]: id })).select("_id date startDate duration durationDays durationDetails").session(session).lean();
    // Check the condition (conflicts.some((candidate) => overlaps(tour, candidate))) and run the matching branch.
    if (conflicts.some((candidate) => overlaps(tour, candidate))) {
      // Stop the current operation by raising the result of Object.assign().
      throw Object.assign(new Error(`Selected ${field.replace("assigned","").toLowerCase()} is already assigned to another overlapping tour.`), { status: 409, code: "RESOURCE_DOUBLE_BOOKED" });
    }
  }
  // Return the object assembled below to the caller.
  return { guide, driver, vehicle };
};

// Declare applyResourceState for use by the surrounding module or function.
const applyResourceState = async ({ tour, resources, session }) => {
  // Declare { guide, driver, vehicle } for use by the surrounding module or function.
  const { guide, driver, vehicle } = resources;
  // Check the condition (guide) and run the matching branch.
  if (guide) { guide.availability = "busy"; guide.assignedTours = [...new Set([...(guide.assignedTours || []).map(String), String(tour._id)])]; await guide.save({ session }); }
  // Check the condition (driver) and run the matching branch.
  if (driver) { driver.availability = "busy"; driver.assignedTours = [...new Set([...(driver.assignedTours || []).map(String), String(tour._id)])]; await driver.save({ session }); }
  // Check the condition (vehicle) and run the matching branch.
  if (vehicle) { vehicle.status = "assigned"; vehicle.assignedTour = tour._id; await vehicle.save({ session }); }
};

// Declare parseStructuredField for use by the surrounding module or function.
const parseStructuredField = (value, field) => {
  // Check the condition (typeof value !== "string") and run the matching branch.
  if (typeof value !== "string") return value;
  // Declare trimmed for use by the surrounding module or function.
  const trimmed = value.trim();
  // Check the condition (!trimmed) and run the matching branch.
  if (!trimmed) return [];
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare parsed for use by the surrounding module or function.
    const parsed = JSON.parse(trimmed);
    // Check the condition (!Array.isArray(parsed) && !["highlights", "inclusions", "exclusions", ) and run the matching branch.
    if (!Array.isArray(parsed) && !["highlights", "inclusions", "exclusions", "languages", "tags"].includes(field)) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`${field} must be a JSON array.`);
    }
    // Return the value of parsed to the caller.
    return parsed;
  } catch (error) {
    // Check the condition (error.message?.includes("must be a JSON array")) and run the matching branch.
    if (error.message?.includes("must be a JSON array")) throw Object.assign(error, { status: 400 });
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`Invalid JSON supplied for tour field: ${field}.`), { status: 400 });
  }
};

// Declare normalizedPayload for use by the surrounding module or function.
const normalizedPayload = (body, files, userId, existing = null) => {
  // Declare normalizedBody for use by the surrounding module or function.
  const normalizedBody = { ...body };
  // Repeat the enclosed work for each required iteration.
  for (const field of ["highlights", "inclusions", "exclusions", "languages", "tags", "itinerary", "availability", "pricingRules"]) {
    // Check the condition (typeof normalizedBody[field] === "string") and run the matching branch.
    if (typeof normalizedBody[field] === "string") normalizedBody[field] = parseStructuredField(normalizedBody[field], field);
  }
  // Repeat the enclosed work for each required iteration.
  for (const field of ["published", "available", "featured", "instantBooking", "taxEnabled"]) {
    // Check the condition (typeof normalizedBody[field] === "string") and run the matching branch.
    if (typeof normalizedBody[field] === "string") {
      // Check the condition (!["true", "false"].includes(normalizedBody[field].toLowerCase())) and run the matching branch.
      if (!["true", "false"].includes(normalizedBody[field].toLowerCase())) throw Object.assign(new Error(`${field} must be true or false.`), { status: 400 });
      // Perform the side effect or state update expressed on the following line.
      normalizedBody[field] = normalizedBody[field].toLowerCase() === "true";
    }
  }
  // Declare source for use by the surrounding module or function.
  const source = existing ? { ...existing.toObject(), ...normalizedBody } : normalizedBody;
  // Declare payload for use by the surrounding module or function.
  const payload = {};
  // Repeat the enclosed work for each required iteration.
  for (const field of MUTABLE_FIELDS) if (Object.prototype.hasOwnProperty.call(source, field)) payload[field] = source[field];
  // Check the condition (!payload.title?.trim() || !payload.description?.trim() || !payload.des) and run the matching branch.
  if (!payload.title?.trim() || !payload.description?.trim() || !payload.destination || !payload.country?.trim() || !payload.location?.trim()) throw Object.assign(new Error("Title, description, destination, country and location are required."), { status: 400 });
  // Check the condition (!payload.date && !payload.startDate) and run the matching branch.
  if (!payload.date && !payload.startDate) throw Object.assign(new Error("A tour date or startDate is required."), { status: 400 });
  // Check the condition (payload.price === undefined || !Number.isFinite(Number(payload.price))) and run the matching branch.
  if (payload.price === undefined || !Number.isFinite(Number(payload.price)) || Number(payload.price) < 0) throw Object.assign(new Error("A valid non-negative price is required."), { status: 400 });
  // Declare requestedDuration for use by the surrounding module or function.
  const requestedDuration = Object.prototype.hasOwnProperty.call(body, "durationDays")
    ? body.durationDays
    : Object.prototype.hasOwnProperty.call(body, "durationDetails")
      ? body.durationDetails?.days
      : Object.prototype.hasOwnProperty.call(body, "duration")
        ? body.duration
        : payload.durationDays ?? payload.durationDetails?.days ?? payload.duration ?? 1;
  // Declare durationDays for use by the surrounding module or function.
  const durationDays = parseDuration(requestedDuration);
  // Perform the side effect or state update expressed on the following line.
  payload.durationDays = durationDays;
  // Perform the side effect or state update expressed on the following line.
  payload.durationDetails = { ...(payload.durationDetails || {}), days: durationDays };
  // Perform the side effect or state update expressed on the following line.
  payload.duration = String(durationDays);
  // Declare startValue for use by the surrounding module or function.
  const startValue = payload.startDate || payload.date;
  // Check the condition (startValue) and run the matching branch.
  if (startValue) {
    // Declare startDate for use by the surrounding module or function.
    const startDate = new Date(startValue);
    // Check the condition (!Number.isNaN(startDate.getTime())) and run the matching branch.
    if (!Number.isNaN(startDate.getTime())) {
      // Perform the side effect or state update expressed on the following line.
      payload.startDate = startDate;
      // Declare calculatedEnd for use by the surrounding module or function.
      const calculatedEnd = new Date(startDate);
      // Perform the side effect or state update expressed on the following line.
      calculatedEnd.setDate(calculatedEnd.getDate() + durationDays - 1);
      // Check the condition (body.endDate !== undefined && body.endDate !== "") and run the matching branch.
      if (body.endDate !== undefined && body.endDate !== "") {
        // Declare requestedEnd for use by the surrounding module or function.
        const requestedEnd = new Date(body.endDate);
        // Check the condition (Number.isNaN(requestedEnd.getTime()) || requestedEnd < startDate) and run the matching branch.
        if (Number.isNaN(requestedEnd.getTime()) || requestedEnd < startDate) {
          // Stop the current operation by raising the result of Object.assign().
          throw Object.assign(new Error("Tour endDate must be valid and cannot be before its start date."), { status: 400 });
        }
        // Perform the side effect or state update expressed on the following line.
        payload.endDate = requestedEnd;
      } else {
        // Perform the side effect or state update expressed on the following line.
        payload.endDate = calculatedEnd;
      }
    }
  }
  // Perform the side effect or state update expressed on the following line.
  payload.price = Number(payload.price);
  // Perform the side effect or state update expressed on the following line.
  payload.capacity = Math.max(1, Number(payload.capacity || 20));
  // Perform the side effect or state update expressed on the following line.
  payload.discount = Math.min(100, Math.max(0, Number(payload.discount || 0)));
  // Perform the side effect or state update expressed on the following line.
  payload.depositType = String(payload.depositType || "fixed").toLowerCase();
  // Check the condition (!["fixed","percentage"].includes(payload.depositType)) and run the matching branch.
  if (!["fixed","percentage"].includes(payload.depositType)) throw Object.assign(new Error("depositType must be fixed or percentage."), { status: 400 });
  // Check the condition (files?.length) and run the matching branch.
  if (files?.length) {
    // Declare images for use by the surrounding module or function.
    const images = files.filter((file) => file?.path).map((file) => ({ url: file.path, publicId: file.filename || file.public_id || "" }));
    // Check the condition (images.length) and run the matching branch.
    if (images.length) { payload.featuredImage = images[0]; payload.gallery = images.slice(1); }
  }
  // Check the condition (!existing) and run the matching branch.
  if (!existing) {
    // Perform the side effect or state update expressed on the following line.
    payload.status = payload.status || "upcoming";
    // Perform the side effect or state update expressed on the following line.
    payload.published = payload.published === undefined ? false : Boolean(payload.published);
    // Perform the side effect or state update expressed on the following line.
    payload.available = payload.available !== false;
    // Perform the side effect or state update expressed on the following line.
    payload.availabilitySettings = payload.availabilitySettings || { totalSlots: payload.capacity, bookedSlots: 0, waitlistEnabled: false };
    // Perform the side effect or state update expressed on the following line.
    payload.createdBy = userId || null;
    // Perform the side effect or state update expressed on the following line.
    payload.isDeleted = false;
  }
  // Return the value of payload to the caller.
  return payload;
};

// Declare createTour for use by the surrounding module or function.
export const createTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare created for use by the surrounding module or function.
    let created;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Declare payload for use by the surrounding module or function.
      const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);
      // Declare destination for use by the surrounding module or function.
      const destination = await Destination.findOne(mergeTenantFilter({ _id: payload.destination, isDeleted: { $ne: true } })).session(session);
      // Check the condition (!destination) and run the matching branch.
      if (!destination) throw Object.assign(new Error("The selected destination does not belong to this tenant."), { status: 400 });
      // Declare resources for use by the surrounding module or function.
      const resources = await assertAssignments({
        guideId: req.body?.assignedGuide || req.body?.guide || null,
        driverId: req.body?.assignedDriver || req.body?.driver || null,
        vehicleId: req.body?.assignedVehicle || req.body?.vehicle || null,
        tour: { ...payload, _id: new mongoose.Types.ObjectId() },
        session,
      });
      // Perform the side effect or state update expressed on the following line.
      payload.assignedGuide = resources.guide?._id || null;
      // Perform the side effect or state update expressed on the following line.
      payload.assignedDriver = resources.driver?._id || null;
      // Perform the side effect or state update expressed on the following line.
      payload.assignedVehicle = resources.vehicle?._id || null;
      // Perform the side effect or state update expressed on the following line.
      payload.assignmentStatus = resources.guide || resources.driver || resources.vehicle ? "assigned" : "pending";
      // Perform the side effect or state update expressed on the following line.
      [created] = await Tour.create([payload], { session });
      // Perform the side effect or state update expressed on the following line.
      await applyResourceState({ tour: created, resources, session });
    });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter({ _id: created._id })).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Tour created successfully.", data: tour, tour });
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

// Declare updateTour for use by the surrounding module or function.
export const updateTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare existing for use by the surrounding module or function.
    const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));
    // Check the condition (!existing) and run the matching branch.
    if (!existing) return res.status(404).json({ success: false, message: "Tour not found." });
    // Check the condition (["assignedGuide","assignedDriver","assignedVehicle","guide","driver",") and run the matching branch.
    if (["assignedGuide","assignedDriver","assignedVehicle","guide","driver","vehicle"].some((key) => req.body?.[key] !== undefined)) return res.status(400).json({ success: false, message: "Use the dedicated tour resource assignment endpoint to change guides, drivers or vehicles." });
    // Declare payload for use by the surrounding module or function.
    const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);
    // Perform the side effect or state update expressed on the following line.
    delete payload.tenantId;
    // Perform the side effect or state update expressed on the following line.
    delete payload.createdBy;
    // Declare updated for use by the surrounding module or function.
    const updated = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: existing._id }), payload, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Tour updated successfully.", data: updated, tour: updated });
  } catch (error) { return next(error); }
};

// Declare deleteTour for use by the surrounding module or function.
export const deleteTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare result for use by the surrounding module or function.
    const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Tour deleted after cancelling/reconciling active bookings.", data: result.tour, bookingsAffected: result.bookingsAffected });
  } catch (error) { return next(error); }
};

// Declare setPublication for use by the surrounding module or function.
export const setPublication = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare published for use by the surrounding module or function.
    const published = req.body?.published;
    // Check the condition (typeof published !== "boolean" && !["true","false"].includes(String(pu) and run the matching branch.
    if (typeof published !== "boolean" && !["true","false"].includes(String(published))) return res.status(400).json({ success: false, message: "published must be a boolean." });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `Tour ${tour.published ? "published" : "unpublished"} successfully.`, data: tour, tour });
  } catch (error) { return next(error); }
};
