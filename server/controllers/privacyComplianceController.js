import PrivacyRequest from "../models/PrivacyRequest.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

export async function getPrivacyComplianceSummary(req, res, next) {
  try {
    const tenantId = requireTenantId();
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 86400000);
    const filter = mergeTenantFilter(req, {});
    const [total, open, overdue, dueSoon, byType] = await Promise.all([
      PrivacyRequest.countDocuments(filter),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] } }),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $lt: now } }),
      PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $gte: now, $lte: soon } }),
      PrivacyRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
    ]);
    return res.json({ success: true, data: { tenantId, total, open, overdue, dueSoon, byType: Object.fromEntries(byType.map((item) => [item._id, item.count])), generatedAt: now.toISOString() } });
  } catch (error) { next(error); }
}
