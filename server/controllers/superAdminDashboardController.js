import mongoose from "mongoose";

const REVENUE_STATUSES = ["completed", "refunded"];
const TENANT_ID_SCOPE = { tenantId: { $type: "objectId" } };
const PLATFORM_OR_LEGACY_SCOPE = {
  $or: [
    TENANT_ID_SCOPE,
    { tenantId: null },
    { tenantId: { $exists: false } },
  ],
};
const toMoney = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });

/**
 * SuperAdmin metrics are platform-wide. Counts use the canonical collections
 * used by the current tenant modules and deliberately distinguish tenant
 * administrators from the platform owner/super-admin account.
 *
 * Data-model rules:
 * - users = canonical login/account identities and roles.
 * - staffs = canonical operational staff profiles used by assignments.
 * - staff = obsolete and must never be counted.
 * - agents = canonical agent profiles linked to users.
 */
export const getSuperAdminDashboard = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(503).json({ success: false, message: "Database connection is not ready." });

    const usersCollection = db.collection("users");
    const rolesCollection = db.collection("roles");

    // Only tenant-scoped admin roles belong in the Administrators card. The
    // platform owner is intentionally not counted as a tenant administrator.
    const adminRoleIds = await rolesCollection.find({
      ...TENANT_ID_SCOPE,
      name: { $in: ["admin", "administrator"] },
    }).project({ _id: 1 }).toArray();
    const adminRoleObjectIds = adminRoleIds.map(({ _id }) => _id);

    const activeStaffScope = {
      ...PLATFORM_OR_LEGACY_SCOPE,
      isDeleted: { $ne: true },
      isActive: true,
      status: "active",
    };

    const activeAgentScope = {
      ...PLATFORM_OR_LEGACY_SCOPE,
      isDeleted: { $ne: true },
      status: "active",
    };

    const [users, staff, agents, vehicles, bookings, admins, tours, destinations, payments, revenueResult] = await Promise.all([
      usersCollection.countDocuments(PLATFORM_OR_LEGACY_SCOPE),
      // Count operational staff profiles, not the obsolete `staff` collection
      // and not user roles. This keeps the dashboard consistent with Staff Management.
      db.collection("staffs").countDocuments(activeStaffScope),
      // "Active Agents" means active agent profiles. Approval is a separate
      // business-state flag and must not make an active account disappear from
      // a card explicitly labelled Active Agents.
      db.collection("agents").countDocuments(activeAgentScope),
      db.collection("vehicles").countDocuments({ ...PLATFORM_OR_LEGACY_SCOPE, isDeleted: { $ne: true }, isActive: true }),
      db.collection("bookings").countDocuments(PLATFORM_OR_LEGACY_SCOPE),
      usersCollection.countDocuments({
        ...TENANT_ID_SCOPE,
        $or: [
          { role: { $in: ["admin", "administrator"] } },
          { legacyRole: { $in: ["admin", "administrator"] } },
          ...(adminRoleObjectIds.length ? [{ roleId: { $in: adminRoleObjectIds } }] : []),
        ],
      }),
      db.collection("tours").countDocuments({ ...PLATFORM_OR_LEGACY_SCOPE, isDeleted: { $ne: true } }),
      db.collection("destinations").countDocuments({ ...PLATFORM_OR_LEGACY_SCOPE, isDeleted: { $ne: true } }),
      db.collection("payments").countDocuments(PLATFORM_OR_LEGACY_SCOPE),
      db.collection("payments").aggregate([
        { $match: { ...PLATFORM_OR_LEGACY_SCOPE, status: { $in: REVENUE_STATUSES } } },
        { $project: {
          status: 1,
          amount: toMoney("$amount"),
          refundedAmount: toMoney("$refundedAmount"),
          refundStatus: { $ifNull: ["$refundStatus", "none"] },
          currency: { $toUpper: { $ifNull: ["$currency", "KES"] } },
        } },
        { $project: {
          status: 1,
          amount: 1,
          refundedAmount: { $cond: [{ $eq: ["$refundStatus", "completed"] }, "$refundedAmount", 0] },
          currency: 1,
        } },
        { $group: {
          _id: "$currency",
          gross: { $sum: "$amount" },
          refunds: { $sum: "$refundedAmount" },
          completedPayments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          refundedPayments: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
        } },
        { $project: {
          _id: 0,
          currency: "$_id",
          gross: 1,
          refunds: 1,
          revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
          completedPayments: 1,
          refundedPayments: 1,
        } },
      ]).toArray(),
    ]);

    const revenueByCurrency = revenueResult || [];
    const primary = revenueByCurrency.find((item) => item.currency === "KES") || revenueByCurrency[0] || null;
    const revenue = Number(primary?.revenue || 0);
    const grossRevenue = Number(primary?.gross || 0);
    const refundedRevenue = Number(primary?.refunds || 0);
    const completedPayments = revenueByCurrency.reduce((sum, item) => sum + Number(item.completedPayments || 0), 0);
    const refundedPayments = revenueByCurrency.reduce((sum, item) => sum + Number(item.refundedPayments || 0), 0);

    const stats = {
      users,
      staff,
      agents,
      vehicles,
      bookings,
      admins,
      tours,
      destinations,
      payments,
      revenue,
      grossRevenue,
      refundedRevenue,
      completedPayments,
      refundedPayments,
      revenueCurrency: primary?.currency || "KES",
      revenueByCurrency,
    };

    return res.status(200).json({ success: true, stats, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("SuperAdmin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load SuperAdmin dashboard." });
  }
};
