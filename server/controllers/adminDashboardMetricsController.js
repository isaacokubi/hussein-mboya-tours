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
      User.countDocuments({ status: "active" }),
      User.countDocuments({ role: "customer", status: "active" }),
      User.countDocuments({ role: { $in: ["admin", "administrator"] }, status: "active" }),
      Staff.countDocuments({ ...active, status: "active", isActive: true }),
      Staff.countDocuments({
        ...active,
        status: "active",
        isActive: true,
        $or: [{ position: "guide" }, { role: { $in: ["guide", "tour_guide", "tourguide"] } }],
      }),
      Staff.countDocuments({
        ...active,
        status: "active",
        isActive: true,
        $or: [{ position: "driver" }, { role: "driver" }],
      }),
      Agent.countDocuments({ status: "active" }),
      Agent.countDocuments({ status: "active", isApproved: true }),
      Agent.countDocuments({ status: "active", isApproved: { $ne: true } }),
      Vehicle.countDocuments({ ...active, isActive: true }),
      Vehicle.countDocuments({ ...active, isActive: true, status: "available" }),
      Vehicle.countDocuments({ ...active, isActive: true, status: "assigned" }),
      Vehicle.countDocuments({ ...active, isActive: true, status: "maintenance" }),
      Tour.countDocuments({ isDeleted: false, published: true, available: true, status: { $in: ["scheduled", "upcoming", "ongoing"] } }),
      Destination.countDocuments({ isDeleted: false, active: true, status: "active" }),
      Booking.countDocuments({ ...active }),
      Booking.countDocuments({ ...active, status: "pending" }),
      Booking.countDocuments({ ...active, status: "confirmed" }),
      Payment.countDocuments({}),
      Payment.countDocuments({ status: "completed" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "failed" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: null,
            gross: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
            refunds: { $sum: { $convert: { input: "$refundedAmount", to: "double", onError: 0, onNull: 0 } } },
          },
        },
      ]),
    ]);

    const revenue = Math.max(0, Number(revenueResult[0]?.gross || 0) - Number(revenueResult[0]?.refunds || 0));

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
        revenueCurrency: "KES",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin dashboard metrics error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message || "Unable to load dashboard metrics." });
  }
};
