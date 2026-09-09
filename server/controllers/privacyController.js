import mongoose from "mongoose";
import PrivacyRequest from "../models/PrivacyRequest.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const TYPES = ["access", "correction", "deletion", "portability", "objection", "restriction"];
const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];

export async function createPrivacyRequest(req, res, next) {
  try {
    const tenantId = requireTenantId();
    const type = String(req.body?.type || "").toLowerCase();
    const requesterName = String(req.body?.requesterName || "").trim();
    if (!TYPES.includes(type) || requesterName.length < 2) return res.status(400).json({ success: false, message: "Valid request type and requester name are required." });
    const request = await PrivacyRequest.create({ tenantId, type, requesterName, requesterEmail: String(req.body?.requesterEmail || "").trim().toLowerCase(), requesterPhone: String(req.body?.requesterPhone || "").trim(), customer: req.body?.customer && mongoose.isValidObjectId(req.body.customer) ? req.body.customer : null });
    return res.status(201).json({ success: true, data: { requestNumber: request.requestNumber, status: request.status, receivedAt: request.receivedAt, dueAt: request.dueAt } });
  } catch (error) { next(error); }
}

export async function listPrivacyRequests(req, res, next) {
  try { requireTenantId(); const data = await PrivacyRequest.find(mergeTenantFilter(req, req.query?.status ? { status: req.query.status } : {})).populate("customer", "name email phone").populate("assignedTo", "name email").sort({ dueAt: 1, createdAt: -1 }).limit(500).lean(); return res.json({ success: true, data }); } catch (error) { next(error); }
}

export async function updatePrivacyRequest(req, res, next) {
  try {
    requireTenantId();
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid privacy request ID." });
    const update = {};
    if (req.body?.status !== undefined) { const status = String(req.body.status).toLowerCase(); if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid privacy request status." }); update.status = status; }
    if (req.body?.assignedTo !== undefined) update.assignedTo = req.body.assignedTo || null;
    if (req.body?.resolutionNotes !== undefined) update.resolutionNotes = String(req.body.resolutionNotes || "").trim();
    const request = await PrivacyRequest.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { $set: update }, { new: true, runValidators: true }).populate("assignedTo", "name email");
    if (!request) return res.status(404).json({ success: false, message: "Privacy request not found." });
    return res.json({ success: true, data: request });
  } catch (error) { next(error); }
}
