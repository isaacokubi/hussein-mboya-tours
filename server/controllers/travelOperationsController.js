/**
 * Purpose: travel Operations Controller HTTP controller. Main declarations: listOperations, createOperation, updateOperation, deleteOperation, listRules.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import OperationalAsset from "../models/OperationalAsset.js";
// Load ../models/TravelCommercialRule.js so this module can use its exported dependencies.
import TravelCommercialRule from "../models/TravelCommercialRule.js";
// Load ../services/travelOperationsService.js so this module can use its exported dependencies.
import { createScheduledOperation, updateScheduledOperation } from "../services/travelOperationsService.js";

// Declare TYPES for use by the surrounding module or function.
const TYPES = new Set(["transfer", "vehicle", "driver", "guide", "room", "voucher", "traveller_document", "incident", "park_fee"]);
// Declare RULES for use by the surrounding module or function.
const RULES = new Set(["dynamic_price", "park_fee", "loyalty", "referral"]);

// Declare listOperations for use by the surrounding module or function.
export const listOperations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId: req.user.tenantId };
    // Repeat the enclosed work for each required iteration.
    for (const key of ["type", "status", "bookingId", "tourId", "assignedTo"]) if (req.query[key]) filter[key] = req.query[key];
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean() });
  } catch (e) { next(e); }
};

// Declare createOperation for use by the surrounding module or function.
export const createOperation = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!TYPES.has(req.body.type) || !req.body.name) and run the matching branch.
    if (!TYPES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid type and name are required." });
    // Check the condition (req.body.startAt && req.body.endAt && new Date(req.body.endAt) <= new ) and run the matching branch.
    if (req.body.startAt && req.body.endAt && new Date(req.body.endAt) <= new Date(req.body.startAt)) return res.status(400).json({ success: false, message: "End time must be after start time." });
    // Declare item for use by the surrounding module or function.
    const item = await createScheduledOperation({ ...req.body, tenantId: req.user.tenantId, createdBy: req.user._id });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: item });
  } catch (e) { next(e); }
};

// Declare updateOperation for use by the surrounding module or function.
export const updateOperation = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare item for use by the surrounding module or function.
    const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    // Check the condition (!item) and run the matching branch.
    if (!item) return res.status(404).json({ success: false, message: "Operation not found." });
    // Declare allowed for use by the surrounding module or function.
    const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];
    // Declare updates for use by the surrounding module or function.
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    // Perform the side effect or state update expressed on the following line.
    updates.updatedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    await updateScheduledOperation(item, updates);
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
};

// Declare deleteOperation for use by the surrounding module or function.
export const deleteOperation = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    // Check the condition (!result.deletedCount) and run the matching branch.
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operation not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Declare listRules for use by the surrounding module or function.
export const listRules = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId: req.user.tenantId };
    // Check the condition (req.query.type && RULES.has(req.query.type)) and run the matching branch.
    if (req.query.type && RULES.has(req.query.type)) filter.type = req.query.type;
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: await TravelCommercialRule.find(filter).sort({ priority: -1, createdAt: -1 }).lean() });
  } catch (e) { next(e); }
};

// Declare createRule for use by the surrounding module or function.
export const createRule = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!RULES.has(req.body.type) || !req.body.name) and run the matching branch.
    if (!RULES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid rule type and name are required." });
    // Declare rule for use by the surrounding module or function.
    const rule = await TravelCommercialRule.create({ ...req.body, tenantId: req.user.tenantId });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: rule });
  } catch (e) { next(e); }
};

// Declare updateRule for use by the surrounding module or function.
export const updateRule = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare rule for use by the surrounding module or function.
    const rule = await TravelCommercialRule.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });
    // Check the condition (!rule) and run the matching branch.
    if (!rule) return res.status(404).json({ success: false, message: "Rule not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: rule });
  } catch (e) { next(e); }
};

// Declare deleteRule for use by the surrounding module or function.
export const deleteRule = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await TravelCommercialRule.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    // Check the condition (!result.deletedCount) and run the matching branch.
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Rule not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true });
  } catch (e) { next(e); }
};
