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

export const getDashboardMetrics = async (req, res) => {
  try {
    const tenantId = requireTenantId();
    const scoped = (query = {}) => ({ tenantId, ...query });

    const [
      users,
      customers,
      adminUsers,
      adminStaff,
      staff,
      guides,
      guideUsers,
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
      User.countDocuments(scoped({ status: { $ne: "blocked" } })),
      User.countDocuments(scoped({ role: "customer", status: { $ne: "blocked" } })),
      User.countDocuments(scoped({ role: { $in: ["admin", "administrator", "super_admin"] }, status: { $ne: "blocked" } })),
      Staff.countDocuments(scoped({ ...active, position: "admin", isActive: { $ne: false }, status: { $ne: "inactive" } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $ne: "inactive" } })),
      Staff.countDocuments(scoped({
        ...active,
        isActive: { $ne: false },
        status: { $ne: "inactive" },
        $or: [
          { position: { $in: ["guide", "tour_guide", "tourguide"] } },
          { role: { $in: ["guide", "tour_guide", "tourguide"] } },
        ],
      })),
      User.countDocuments(scoped({ role: { $in: ["guide", "tour_guide", "tourguide"] }, status: { $ne: "blocked" } })),
      Staff.countDocuments(scoped({
        ...active,
        isActive: { $ne: false },
        status: { $ne: "inactive" },
        $or: [
          { position: { $in: ["driver", "chauffeur"] } },
          { role: { $in: ["driver", "chauffeur"] } },
        ],
      })),
      Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $ne: "inactive" } })),
      Agent.countDocuments(scoped({
        isDeleted: { $ne: true },
        status: { $ne: "inactive" },
        $or: [{ isApproved: true }, { status: "approved" }],
      })),
      Agent.countDocuments(scoped({
        isDeleted: { $ne: true },
        status: { $nin: ["inactive", "approved"] },
        isApproved: { $ne: true },
      })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false } })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "available" })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "assigned" })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "maintenance" })),
      Tour.countDocuments(scoped(active)),
      Destination.countDocuments(scoped(active)),
      Booking.countDocuments(scoped(active)),
      Booking.countDocuments(scoped({ ...active, status: "pending" })),
      Booking.countDocuments(scoped({ ...active, status: "confirmed" })),
      Payment.countDocuments(scoped(active)),
      Payment.countDocuments(scoped({ ...active, status: "completed" })),
      Payment.countDocuments(scoped({ ...active, status: "pending" })),
      Payment.countDocuments(scoped({ ...active, status: "failed" })),
      Payment.aggregate([
        { $match: scoped({ ...active, status: "completed" }) },
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
        admins: Math.max(adminUsers, adminStaff),
        staff,
        guides: Math.max(guides, guideUsers),
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
