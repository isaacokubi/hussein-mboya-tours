import mongoose from "mongoose";
import Role from "../models/Role.js";

const REVENUE_STATUSES = ["completed", "refunded"];
const toMoney = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });

/**
 * SuperAdmin metrics are platform-wide. Use the MongoDB collections directly
 * here so tenant-scoped Mongoose middleware can never accidentally hide a
 * tenant's records from the platform control center.
 */
export const getSuperAdminDashboard = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(503).json({ success: false, message: "Database connection is not ready." });

    const usersCollection = db.collection("users");
    const rolesCollection = db.collection("roles");
    const adminRoleIds = await rolesCollection.find({ name: { $in: ["admin", "administrator", "superadmin", "super_admin"] } }).project({ _id: 1 }).toArray();
    const adminRoleObjectIds = adminRoleIds.map(({ _id }) => _id);

    const [users, staff, agents, vehicles, bookings, admins, tours, destinations, payments, revenueResult] = await Promise.all([
      usersCollection.countDocuments({}),
      db.collection("staffs").countDocuments({}),
      db.collection("agents").countDocuments({}),
      db.collection("vehicles").countDocuments({}),
      db.collection("bookings").countDocuments({}),
      usersCollection.countDocuments({
        $or: [
          { role: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
          { legacyRole: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
          ...(adminRoleObjectIds.length ? [{ roleId: { $in: adminRoleObjectIds } }] : []),
        ],
      }),
      db.collection("tours").countDocuments({}),
      db.collection("destinations").countDocuments({}),
      db.collection("payments").countDocuments({}),
      db.collection("payments").aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
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
