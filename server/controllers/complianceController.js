/**
 * Purpose: compliance Controller HTTP controller. Main declarations: listComplianceRecords, upsertComplianceRecord, getComplianceSummary, queueEtimsInvoice, getEtimsInvoiceStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/ComplianceRecord.js so this module can use its exported dependencies.
import ComplianceRecord from "../models/ComplianceRecord.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/EtimsSubmission.js so this module can use its exported dependencies.
import EtimsSubmission from "../models/EtimsSubmission.js";
// Load ../services/etimsService.js so this module can use its exported dependencies.
import { enqueueInvoiceForEtims } from "../services/etimsService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare TYPES for use by the surrounding module or function.
const TYPES = ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "DPA_REVIEW", "BREACH_RESPONSE", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"];
// Declare STATUSES for use by the surrounding module or function.
const STATUSES = ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"];
// Define listComplianceRecords; its parameters and body implement this operation.
export async function listComplianceRecords(req, res, next) { try { requireTenantId(); const data = await ComplianceRecord.find(mergeTenantFilter(req, req.query?.type ? { type: req.query.type } : {})).populate("owner", "name email").sort({ expiryDate: 1, type: 1 }).lean(); return res.json({ success: true, data }); } catch (error) { next(error); } }
// Define upsertComplianceRecord; its parameters and body implement this operation.
export async function upsertComplianceRecord(req, res, next) { try { const tenantId = requireTenantId(); const type = String(req.body?.type || "").toUpperCase(); if (!TYPES.includes(type)) return res.status(400).json({ success: false, message: "Invalid compliance record type." }); const status = req.body?.status ? String(req.body.status).toLowerCase() : "not_started"; if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid compliance status." }); const data = { status, referenceNumber: String(req.body?.referenceNumber || "").trim(), authority: String(req.body?.authority || "").trim(), issueDate: req.body?.issueDate || null, expiryDate: req.body?.expiryDate || null, owner: req.body?.owner || null, notes: String(req.body?.notes || "").trim(), documents: Array.isArray(req.body?.documents) ? req.body.documents.slice(0, 50) : [], lastReviewedAt: new Date(), nextReviewAt: req.body?.nextReviewAt || null, createdBy: req.user?._id || null }; const record = await ComplianceRecord.findOneAndUpdate({ tenantId, type }, { $set: data, $setOnInsert: { tenantId, type } }, { upsert: true, new: true, runValidators: true }); return res.json({ success: true, data: record }); } catch (error) { next(error); } }
// Define getComplianceSummary; its parameters and body implement this operation.
export async function getComplianceSummary(req, res, next) { try { requireTenantId(); const records = await ComplianceRecord.find(mergeTenantFilter(req, {})).lean(); const now = Date.now(); const expiringSoon = records.filter((r) => r.expiryDate && new Date(r.expiryDate).getTime() <= now + 30 * 86400000 && new Date(r.expiryDate).getTime() >= now).length; const expired = records.filter((r) => r.expiryDate && new Date(r.expiryDate).getTime() < now).length; const actionRequired = records.filter((r) => ["action_required", "expired"].includes(r.status)).length; return res.json({ success: true, data: { total: records.length, expiringSoon, expired, actionRequired, records } }); } catch (error) { next(error); } }
// Define queueEtimsInvoice; its parameters and body implement this operation.
export async function queueEtimsInvoice(req, res, next) { try { const tenantId = requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID." }); const invoice = await Invoice.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).select("_id tenantId etimsStatus invoiceNumber etimsInvoiceNumber etimsReceiptNumber etimsUniqueRegisterIdentifier etimsQrCode etimsLastError etimsSubmissionAttempts etimsNextRetryAt").lean(); if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." }); const job = await enqueueInvoiceForEtims(invoice._id, tenantId, { manualRetry: true }); return res.status(202).json({ success: true, message: "Invoice queued for eTIMS adapter submission.", data: { invoice, jobId: job._id, jobStatus: job.status } }); } catch (error) { next(error); } }
// Define getEtimsInvoiceStatus; its parameters and body implement this operation.
export async function getEtimsInvoiceStatus(req, res, next) { try { requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID." }); const invoice = await Invoice.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean(); if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." }); const submissions = await EtimsSubmission.find(mergeTenantFilter(req, { documentType: "invoice", documentId: invoice._id })).sort({ attempt: -1 }).limit(20).lean(); return res.json({ success: true, data: { invoice, submissions } }); } catch (error) { next(error); } }
