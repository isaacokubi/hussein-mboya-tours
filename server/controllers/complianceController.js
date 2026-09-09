import ComplianceRecord from "../models/ComplianceRecord.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const TYPES = ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "DPA_REVIEW", "BREACH_RESPONSE", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"];
const STATUSES = ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"];

export async function listComplianceRecords(req, res, next) {
  try {
    requireTenantId();
    const data = await ComplianceRecord.find(mergeTenantFilter(req, req.query?.type ? { type: req.query.type } : {})).populate("owner", "name email").sort({ expiryDate: 1, type: 1 }).lean();
    return res.json({ success: true, data });
  } catch (error) { next(error); }
}

export async function upsertComplianceRecord(req, res, next) {
  try {
    const tenantId = requireTenantId();
    const type = String(req.body?.type || "").toUpperCase();
    if (!TYPES.includes(type)) return res.status(400).json({ success: false, message: "Invalid compliance record type." });
    const status = req.body?.status ? String(req.body.status).toLowerCase() : "not_started";
    if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid compliance status." });
    const data = { status, referenceNumber: String(req.body?.referenceNumber || "").trim(), authority: String(req.body?.authority || "").trim(), issueDate: req.body?.issueDate || null, expiryDate: req.body?.expiryDate || null, owner: req.body?.owner || null, notes: String(req.body?.notes || "").trim(), documents: Array.isArray(req.body?.documents) ? req.body.documents.slice(0, 50) : [], lastReviewedAt: new Date(), nextReviewAt: req.body?.nextReviewAt || null, createdBy: req.user?._id || null };
    const record = await ComplianceRecord.findOneAndUpdate({ tenantId, type }, { $set: data, $setOnInsert: { tenantId, type } }, { upsert: true, new: true, runValidators: true });
    return res.json({ success: true, data: record });
  } catch (error) { next(error); }
}

export async function getComplianceSummary(req, res, next) {
  try {
    requireTenantId();
    const tenantId = req.tenantId;
    const records = await ComplianceRecord.find({ tenantId }).lean();
    const now = Date.now();
    const expiringSoon = records.filter((r) => r.expiryDate && new Date(r.expiryDate).getTime() <= now + 30 * 86400000 && new Date(r.expiryDate).getTime() >= now).length;
    const expired = records.filter((r) => r.expiryDate && new Date(r.expiryDate).getTime() < now).length;
    const actionRequired = records.filter((r) => ["action_required", "expired"].includes(r.status)).length;
    return res.json({ success: true, data: { total: records.length, expiringSoon, expired, actionRequired, records } });
  } catch (error) { next(error); }
}
