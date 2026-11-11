/**
 * Purpose: privacy Compliance Controller HTTP controller. Main declarations: getPrivacyComplianceSummary.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import PrivacyRequest from "../models/PrivacyRequest.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Define getPrivacyComplianceSummary; its parameters and body implement this operation.
export async function getPrivacyComplianceSummary(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare soon for use by the surrounding module or function.
    const soon = new Date(now.getTime() + 7 * 86400000);
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, {});
    // Declare [total, open, overdue, dueSoon, byType] for use by the surrounding module or function.
    const [total, open, overdue, dueSoon, byType] = await Promise.all([
      PrivacyRequest.countDocuments(filter),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] } }),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $lt: now } }),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $gte: now, $lte: soon } }),
      PrivacyRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { tenantId, total, open, overdue, dueSoon, byType: Object.fromEntries(byType.map((item) => [item._id, item.count])), generatedAt: now.toISOString() } });
  } catch (error) { next(error); }
}
