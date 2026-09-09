import TravelServiceRequest from "../models/TravelServiceRequest.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";

const uid = (req) => req.user?._id || req.user?.id || null;
const clean = (value) => String(value ?? "").trim();
const allowedTypes = new Set(["airport_transfer", "accommodation", "rooming_list", "travel_document", "insurance", "manifest", "incident", "schedule", "cancellation", "special_service"]);
const allowedStatuses = new Set(["open", "in_progress", "awaiting_customer", "resolved", "cancelled"]);
const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);

export const listTravelServiceRequests = async (req, res, next) => {
  try {
    const filter = tenantFilter(req);
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.booking) filter.booking = req.query.booking;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const data = await TravelServiceRequest.find(filter)
      .populate("booking", "bookingReference travelDate status totalAmount")
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email role")
      .sort({ priority: -1, requestedDate: 1, createdAt: -1 })
      .limit(limit).lean();
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
};

export const createTravelServiceRequest = async (req, res, next) => {
  try {
    const type = clean(req.body.type);
    const title = clean(req.body.title);
    if (!allowedTypes.has(type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });
    if (!title) return res.status(400).json({ success: false, message: "A request title is required." });
    const data = await TravelServiceRequest.create({
      ...req.body, tenantId: req.tenantId, type, title,
      status: "open",
      priority: allowedPriorities.has(req.body.priority) ? req.body.priority : "normal",
      createdBy: uid(req), updatedBy: uid(req),
    });
    return res.status(201).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const updateTravelServiceRequest = async (req, res, next) => {
  try {
    const patch = { ...req.body, updatedBy: uid(req) };
    if (patch.status && !allowedStatuses.has(patch.status)) return res.status(400).json({ success: false, message: "Invalid request status." });
    if (patch.priority && !allowedPriorities.has(patch.priority)) return res.status(400).json({ success: false, message: "Invalid request priority." });
    if (patch.type && !allowedTypes.has(patch.type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });
    if (patch.status === "resolved") { patch.resolvedAt = new Date(); }
    const data = await TravelServiceRequest.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true })
      .populate("booking", "bookingReference travelDate status totalAmount")
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email role");
    if (!data) return res.status(404).json({ success: false, message: "Service request not found." });
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
};

export const getTravelServiceSummary = async (req, res, next) => {
  try {
    const filter = tenantFilter(req);
    const [byType, byStatus, urgent] = await Promise.all([
      TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      TravelServiceRequest.countDocuments({ ...filter, priority: "urgent", status: { $nin: ["resolved", "cancelled"] } }),
    ]);
    return res.json({ success: true, data: { byType, byStatus, urgent } });
  } catch (error) { return next(error); }
};
