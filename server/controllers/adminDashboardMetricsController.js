import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import { requireTenantId } from "../tenancy/context.js";

const active = { isDeleted: { $ne: true } };

export const getDashboardMetrics = async (_req, res) => {
  try {
    const tenantId = requireTenantId();

    const [
      users,
      customers,
      admins,
      staff,
      guides,
      drivers,
      agents,
      approvedAgents,
      pendingAgents,
      vehicles,
      availableVehicles,
      assignedVehicles,
      maintenanceVehicles,
      tours,
      destinations,
      bookings,
      pendingBookings,
      confirmedBookings,
      payments,
      completedPayments,
      pendingPayments,
      failedPayments,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ status: { $ne: "blocked" } }),
      User.countDocuments({ role: "customer", status: { $ne: "blocked" } }),
      User.countDocuments({ role: { $in: ["admin", "administrator"] }, status: { $ne: "blocked" } }),
      Staff.countDocuments({ ...active }),
      Staff.countDocuments({
        ...active,
        $or: [{ position: "guide" }, { role: { $in: ["guide", "tour_guide", "tourguide"] } }],
      }),
      Staff.countDocuments({
        ...active,
        $or: [{ position: "driver" }, { role: "driver" }],
      }),
      Agent.countDocuments({ isDeleted: { $ne: true } }),
      Agent.countDocuments({ isDeleted: { $ne: true }, isApproved: true }),
      Agent.countDocuments({ isDeleted: { $ne: true }, isApproved: { $ne: true } }),
      Vehicle.countDocuments({ ...active }),
      Vehicle.countDocuments({ ...active, status: "available" }),
      Vehicle.countDocuments({ ...active, status: "assigned" }),
      Vehicle.countDocuments({ ...active, status: "maintenance" }),
      Tour.countDocuments({ ...active }),
      Destination.countDocuments({ ...active }),
      Booking.countDocuments({ ...active }),
      Booking.countDocuments({ ...active, status: "pending" }),
      Booking.countDocuments({ ...active, status: "confirmed" }),
      Payment.countDocuments({ ...active }),
      Payment.countDocuments({ ...active, status: "completed" }),
      Payment.countDocuments({ ...active, status: "pending" }),
      Payment.countDocuments({ ...active, status: "failed" }),
      Payment.aggregate([
        {
          $match: {
            ...active,
            status: "completed",
          },
        },
        {
          $project: {
            amount: {
              $convert: {
                input: "$amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            refundedAmount: {
              $cond: [
                { $eq: ["$refundStatus", "completed"] },
                {
                  $convert: {
                    input: "$refundedAmount",
                    to: "double",
                    onError: 0,
                    onNull: 0,
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            gross: { $sum: "$amount" },
            refunds: { $sum: "$refundedAmount" },
          },
        },
      ]),
    ]);

    const gross = Number(revenueResult[0]?.gross || 0);
    const refunds = Number(revenueResult[0]?.refunds || 0);
    const revenue = Math.max(0, gross - refunds);

    return res.json({
      success: true,
      scope: { tenantId: String(tenantId), type: "tenant" },
      data: {
        users,
        customers,
        admins,
        staff,
        guides,
        drivers,
        agents,
        approvedAgents,
        pendingAgents,
        vehicles,
        availableVehicles,
        assignedVehicles,
        maintenanceVehicles,
        tours,
        destinations,
        bookings,
        pendingBookings,
        confirmedBookings,
        payments,
        completedPayments,
        pendingPayments,
        failedPayments,
        revenue,
        grossRevenue: gross,
        refundedRevenue: refunds,
        revenueCurrency: "KES",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin dashboard metrics error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to load dashboard metrics.",
    });
  }
};
