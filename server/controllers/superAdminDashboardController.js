import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Role from "../models/Role.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

const COMPLETED = "completed";
const toMoney = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const VehicleModel = Vehicle && typeof Vehicle.countDocuments === "function" ? Vehicle : mongoose.models.Vehicle;

    const data = await runWithTenant({ tenantId: null, tenant: null, bypass: true, role: "super_admin" }, async () => {
      const adminRoleIds = await Role.find({ name: { $in: ["admin", "administrator", "superadmin", "super_admin"] } }).distinct("_id");

      const [users, staff, agents, vehicles, bookings, admins, tours, destinations, payments, revenueResult] = await Promise.all([
        User.countDocuments(),
        Staff.countDocuments(),
        Agent.countDocuments(),
        VehicleModel ? VehicleModel.countDocuments() : 0,
        Booking.countDocuments(),
        User.countDocuments({ $or: [
          { role: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
          { legacyRole: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
          ...(adminRoleIds.length ? [{ roleId: { $in: adminRoleIds } }] : []),
        ] }),
        Tour.countDocuments(),
        Destination.countDocuments(),
        Payment.countDocuments(),
        Payment.aggregate([
          { $match: { status: COMPLETED } },
          { $project: {
            amount: toMoney("$amount"),
            refundedAmount: toMoney("$refundedAmount"),
            currency: { $ifNull: ["$currency", "KES"] },
          } },
          { $group: {
            _id: "$currency",
            gross: { $sum: "$amount" },
            refunds: { $sum: "$refundedAmount" },
            completedPayments: { $sum: 1 },
          } },
          { $project: {
            _id: 0,
            currency: "$_id",
            gross: 1,
            refunds: 1,
            revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
            completedPayments: 1,
          } },
        ]),
      ]);

      // Revenue is platform-wide net cash received: completed payments less completed refunds.
      // Booking totals are deliberately excluded because a booking can be unpaid or refunded.
      const revenueByCurrency = revenueResult || [];
      const primary = revenueByCurrency.find((item) => item.currency === "KES") || revenueByCurrency[0];
      const revenue = primary?.revenue || 0;
      const grossRevenue = primary?.gross || 0;
      const refundedRevenue = primary?.refunds || 0;
      const completedPayments = revenueByCurrency.reduce((sum, item) => sum + (item.completedPayments || 0), 0);

      return {
        users, staff, agents, vehicles, bookings, admins, tours, destinations, payments,
        revenue, grossRevenue, refundedRevenue, completedPayments,
        revenueByCurrency,
      };
    });

    return res.status(200).json({
      success: true,
      stats: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value : Number(value) || 0])),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SuperAdmin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load SuperAdmin dashboard." });
  }
};
