/**
 * Purpose: travel Service Request Controller HTTP controller. Main declarations: uid, clean, listTravelServiceRequests, createTravelServiceRequest, updateTravelServiceRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import TravelServiceRequest from "../models/TravelServiceRequest.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";

// Declare uid for use by the surrounding module or function.
const uid = (req) => req.user?._id || req.user?.id || null;
// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare allowedTypes for use by the surrounding module or function.
const allowedTypes = new Set(["airport_transfer", "accommodation", "rooming_list", "travel_document", "insurance", "manifest", "incident", "schedule", "cancellation", "special_service"]);
// Declare allowedStatuses for use by the surrounding module or function.
const allowedStatuses = new Set(["open", "in_progress", "awaiting_customer", "resolved", "cancelled"]);
// Declare allowedPriorities for use by the surrounding module or function.
const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);

// Declare listTravelServiceRequests for use by the surrounding module or function.
export const listTravelServiceRequests = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Check the condition (req.query.type) and run the matching branch.
    if (req.query.type) filter.type = req.query.type;
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Check the condition (req.query.priority) and run the matching branch.
    if (req.query.priority) filter.priority = req.query.priority;
    // Check the condition (req.query.booking) and run the matching branch.
    if (req.query.booking) filter.booking = req.query.booking;
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    // Declare data for use by the surrounding module or function.
    const data = await TravelServiceRequest.find(filter)
      .populate("booking", "bookingReference travelDate status totalAmount")
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email role")
      .sort({ priority: -1, requestedDate: 1, createdAt: -1 })
      .limit(limit).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
};

// Declare createTravelServiceRequest for use by the surrounding module or function.
export const createTravelServiceRequest = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare type for use by the surrounding module or function.
    const type = clean(req.body.type);
    // Declare title for use by the surrounding module or function.
    const title = clean(req.body.title);
    // Check the condition (!allowedTypes.has(type)) and run the matching branch.
    if (!allowedTypes.has(type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });
    // Check the condition (!title) and run the matching branch.
    if (!title) return res.status(400).json({ success: false, message: "A request title is required." });
    // Declare data for use by the surrounding module or function.
    const data = await TravelServiceRequest.create({
      ...req.body, tenantId: req.tenantId, type, title,
      status: "open",
      priority: allowedPriorities.has(req.body.priority) ? req.body.priority : "normal",
      createdBy: uid(req), updatedBy: uid(req),
    });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data });
  } catch (error) { return next(error); }
};

// Declare updateTravelServiceRequest for use by the surrounding module or function.
export const updateTravelServiceRequest = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare patch for use by the surrounding module or function.
    const patch = { ...req.body, updatedBy: uid(req) };
    // Check the condition (patch.status && !allowedStatuses.has(patch.status)) and run the matching branch.
    if (patch.status && !allowedStatuses.has(patch.status)) return res.status(400).json({ success: false, message: "Invalid request status." });
    // Check the condition (patch.priority && !allowedPriorities.has(patch.priority)) and run the matching branch.
    if (patch.priority && !allowedPriorities.has(patch.priority)) return res.status(400).json({ success: false, message: "Invalid request priority." });
    // Check the condition (patch.type && !allowedTypes.has(patch.type)) and run the matching branch.
    if (patch.type && !allowedTypes.has(patch.type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });
    // Check the condition (patch.status === "resolved") and run the matching branch.
    if (patch.status === "resolved") { patch.resolvedAt = new Date(); }
    // Declare data for use by the surrounding module or function.
    const data = await TravelServiceRequest.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true })
      .populate("booking", "bookingReference travelDate status totalAmount")
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email role");
    // Check the condition (!data) and run the matching branch.
    if (!data) return res.status(404).json({ success: false, message: "Service request not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
};

// Declare getTravelServiceSummary for use by the surrounding module or function.
export const getTravelServiceSummary = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare [byType, byStatus, urgent] for use by the surrounding module or function.
    const [byType, byStatus, urgent] = await Promise.all([
      TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      TravelServiceRequest.countDocuments({ ...filter, priority: "urgent", status: { $nin: ["resolved", "cancelled"] } }),
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { byType, byStatus, urgent } });
  } catch (error) { return next(error); }
};
