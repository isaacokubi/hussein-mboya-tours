import OperationalAsset from "../models/OperationalAsset.js";
import TravelCommercialRule from "../models/TravelCommercialRule.js";
import { createScheduledOperation, updateScheduledOperation } from "../services/travelOperationsService.js";

const TYPES = new Set(["transfer", "vehicle", "driver", "guide", "room", "voucher", "traveller_document", "incident", "park_fee"]);
const RULES = new Set(["dynamic_price", "park_fee", "loyalty", "referral"]);

export const listOperations = async (req, res, next) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    for (const key of ["type", "status", "bookingId", "tourId", "assignedTo"]) if (req.query[key]) filter[key] = req.query[key];
    res.json({ success: true, data: await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean() });
  } catch (e) { next(e); }
};

export const createOperation = async (req, res, next) => {
  try {
    if (!TYPES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid type and name are required." });
    if (req.body.startAt && req.body.endAt && new Date(req.body.endAt) <= new Date(req.body.startAt)) return res.status(400).json({ success: false, message: "End time must be after start time." });
    const item = await createScheduledOperation({ ...req.body, tenantId: req.user.tenantId, createdBy: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (e) { next(e); }
};

export const updateOperation = async (req, res, next) => {
  try {
    const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ success: false, message: "Operation not found." });
    const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    updates.updatedBy = req.user._id;
    await updateScheduledOperation(item, updates);
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
};

export const deleteOperation = async (req, res, next) => {
  try {
    const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operation not found." });
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const listRules = async (req, res, next) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    if (req.query.type && RULES.has(req.query.type)) filter.type = req.query.type;
    res.json({ success: true, data: await TravelCommercialRule.find(filter).sort({ priority: -1, createdAt: -1 }).lean() });
  } catch (e) { next(e); }
};

export const createRule = async (req, res, next) => {
  try {
    if (!RULES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid rule type and name are required." });
    const rule = await TravelCommercialRule.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json({ success: true, data: rule });
  } catch (e) { next(e); }
};

export const updateRule = async (req, res, next) => {
  try {
    const rule = await TravelCommercialRule.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });
    if (!rule) return res.status(404).json({ success: false, message: "Rule not found." });
    res.json({ success: true, data: rule });
  } catch (e) { next(e); }
};

export const deleteRule = async (req, res, next) => {
  try {
    const result = await TravelCommercialRule.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Rule not found." });
    res.json({ success: true });
  } catch (e) { next(e); }
};
