/**
 * Purpose: privacy Controller HTTP controller. Main declarations: createPrivacyRequest, listPrivacyRequests, updatePrivacyRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/PrivacyRequest.js so this module can use its exported dependencies.
import PrivacyRequest from "../models/PrivacyRequest.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare TYPES for use by the surrounding module or function.
const TYPES = ["access", "correction", "deletion", "portability", "objection", "restriction"];
// Declare STATUSES for use by the surrounding module or function.
const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];
// Declare TRANSITIONS for use by the surrounding module or function.
const TRANSITIONS = { received: ["identity_verification", "in_progress", "rejected", "cancelled"], identity_verification: ["in_progress", "rejected", "cancelled"], in_progress: ["completed", "rejected", "cancelled"], completed: [], rejected: [], cancelled: [] };

// Define createPrivacyRequest; its parameters and body implement this operation.
export async function createPrivacyRequest(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare type for use by the surrounding module or function.
    const type = String(req.body?.type || "").toLowerCase();
    // Declare requesterName for use by the surrounding module or function.
    const requesterName = String(req.body?.requesterName || "").trim();
    // Check the condition (!TYPES.includes(type) || requesterName.length < 2) and run the matching branch.
    if (!TYPES.includes(type) || requesterName.length < 2) return res.status(400).json({ success: false, message: "Valid request type and requester name are required." });
    // Declare customer for use by the surrounding module or function.
    let customer = null;
    // Check the condition (req.body?.customer) and run the matching branch.
    if (req.body?.customer) {
      // Check the condition (!mongoose.isValidObjectId(req.body.customer)) and run the matching branch.
      if (!mongoose.isValidObjectId(req.body.customer)) return res.status(400).json({ success: false, message: "Invalid customer ID." });
      // Perform the side effect or state update expressed on the following line.
      customer = await Customer.findOne(mergeTenantFilter(req, { _id: req.body.customer })).select("_id").lean();
      // Check the condition (!customer) and run the matching branch.
      if (!customer) return res.status(404).json({ success: false, message: "Customer not found in this tenant." });
    }
    // Declare request for use by the surrounding module or function.
    const request = await PrivacyRequest.create({ tenantId, type, requesterName, requesterEmail: String(req.body?.requesterEmail || "").trim().toLowerCase(), requesterPhone: String(req.body?.requesterPhone || "").trim(), customer: customer?._id || null });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: { requestNumber: request.requestNumber, status: request.status, receivedAt: request.receivedAt, dueAt: request.dueAt } });
  } catch (error) { next(error); }
}

// Define listPrivacyRequests; its parameters and body implement this operation.
export async function listPrivacyRequests(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try { requireTenantId(); const data = await PrivacyRequest.find(mergeTenantFilter(req, req.query?.status ? { status: req.query.status } : {})).populate("customer", "name email phone").populate("assignedTo", "name email").sort({ dueAt: 1, createdAt: -1 }).limit(500).lean(); return res.json({ success: true, data }); } catch (error) { next(error); }
}

// Define updatePrivacyRequest; its parameters and body implement this operation.
export async function updatePrivacyRequest(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!mongoose.isValidObjectId(req.params.id)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid privacy request ID." });
    // Declare request for use by the surrounding module or function.
    const request = await PrivacyRequest.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!request) and run the matching branch.
    if (!request) return res.status(404).json({ success: false, message: "Privacy request not found." });
    // Declare update for use by the surrounding module or function.
    const update = {};
    // Check the condition (req.body?.status !== undefined) and run the matching branch.
    if (req.body?.status !== undefined) {
      // Declare status for use by the surrounding module or function.
      const status = String(req.body.status).toLowerCase();
      // Check the condition (!STATUSES.includes(status)) and run the matching branch.
      if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid privacy request status." });
      // Check the condition (status !== request.status && !TRANSITIONS[request.status]?.includes(st) and run the matching branch.
      if (status !== request.status && !TRANSITIONS[request.status]?.includes(status)) return res.status(409).json({ success: false, message: `Privacy request cannot transition from ${request.status} to ${status}.` });
      // Perform the side effect or state update expressed on the following line.
      update.status = status;
    }
    // Check the condition (req.body?.assignedTo !== undefined) and run the matching branch.
    if (req.body?.assignedTo !== undefined) {
      // Check the condition (req.body.assignedTo && !mongoose.isValidObjectId(req.body.assignedTo)) and run the matching branch.
      if (req.body.assignedTo && !mongoose.isValidObjectId(req.body.assignedTo)) return res.status(400).json({ success: false, message: "Invalid assignee ID." });
      // Check the condition (req.body.assignedTo && !(await User.exists(mergeTenantFilter(req, { _i) and run the matching branch.
      if (req.body.assignedTo && !(await User.exists(mergeTenantFilter(req, { _id: req.body.assignedTo })))) return res.status(404).json({ success: false, message: "Assignee not found in this tenant." });
      // Perform the side effect or state update expressed on the following line.
      update.assignedTo = req.body.assignedTo || null;
    }
    // Check the condition (req.body?.resolutionNotes !== undefined) and run the matching branch.
    if (req.body?.resolutionNotes !== undefined) update.resolutionNotes = String(req.body.resolutionNotes || "").trim();
    // Declare updated for use by the surrounding module or function.
    const updated = await PrivacyRequest.findOneAndUpdate({ ...mergeTenantFilter(req, { _id: request._id }) }, { $set: update }, { new: true, runValidators: true }).populate("assignedTo", "name email");
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: updated });
  } catch (error) { next(error); }
}
