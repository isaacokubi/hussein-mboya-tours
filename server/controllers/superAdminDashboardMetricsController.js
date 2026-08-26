import mongoose from "mongoose";

const tenantScope = { tenantId: { $type: "objectId" } };
const platformScope = { $or: [tenantScope, { tenantId: null }, { tenantId: { $exists: false } }] };

const count = async (db, collection, filter = {}) => db.collection(collection).countDocuments(filter);

export const getSuperAdminDashboardMetrics = async (_req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(503).json({ success: false, message: "Database connection is not ready." });

    const active = { isDeleted: { $ne: true } };
    const activeScoped = { ...platformScope, isDeleted: { $ne: true } };

    const tenantRows = await db.collection("organizations")
      .find({ status: { $in: ["active", "trial"] } })
      .project({ _id: 1, name: 1, slug: 1, status: 1 })
      .sort({ createdAt: 1 })
      .toArray();

    const [users, staff, agents, approvedAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, bookings, tours, destinations, payments, completedPayments, customers, pendingBookings, confirmedBookings] = await Promise.all([
      count(db, "users", platformScope),
      count(db, "staffs", { ...activeScoped, status: "active", isActive: true }),
      count(db, "agents", { ...activeScoped, status: "active" }),
      count(db, "agents", { ...activeScoped, status: "active", isApproved: true }),
      count(db, "vehicles", { ...activeScoped, isActive: true }),
      count(db, "vehicles", { ...activeScoped, isActive: true, status: "available" }),
      count(db, "vehicles", { ...activeScoped, isActive: true, status: "assigned" }),
      count(db, "vehicles", { ...activeScoped, isActive: true, status: "maintenance" }),
      count(db, "bookings", { ...activeScoped }),
      count(db, "tours", { ...activeScoped }),
      count(db, "destinations", { ...activeScoped }),
      count(db, "payments", platformScope),
      count(db, "payments", { ...platformScope, status: "completed" }),
      count(db, "users", { ...platformScope, role: "customer", status: "active" }),
      count(db, "bookings", { ...activeScoped, status: "pending" }),
      count(db, "bookings", { ...activeScoped, status: "confirmed" }),
    ]);

    const revenueRows = await db.collection("payments").aggregate([
      { $match: { ...platformScope, status: "completed" } },
      { $project: {
        currency: { $toUpper: { $ifNull: ["$currency", "KES"] } },
        amount: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } },
        refundedAmount: { $convert: { input: "$refundedAmount", to: "double", onError: 0, onNull: 0 } },
      } },
      { $group: { _id: "$currency", gross: { $sum: "$amount" }, refunds: { $sum: "$refundedAmount" } } },
      { $project: { _id: 0, currency: "$_id", gross: 1, refunds: 1, revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] } } },
      { $sort: { currency: 1 } },
    ]).toArray();

    const tenants = [];
    for (const tenant of tenantRows) {
      const tenantId = tenant._id;
      const scope = { tenantId };
      const [tenantUsers, tenantStaff, tenantAgents, tenantVehicles, tenantTours, tenantDestinations, tenantBookings, tenantPayments] = await Promise.all([
        count(db, "users", scope),
        count(db, "staffs", { ...scope, isDeleted: { $ne: true }, status: "active", isActive: true }),
        count(db, "agents", { ...scope, isDeleted: { $ne: true }, status: "active" }),
        count(db, "vehicles", { ...scope, isDeleted: { $ne: true }, isActive: true }),
        count(db, "tours", { ...scope, isDeleted: { $ne: true } }),
        count(db, "destinations", { ...scope, isDeleted: { $ne: true } }),
        count(db, "bookings", { ...scope, isDeleted: { $ne: true } }),
        count(db, "payments", scope),
      ]);
      tenants.push({
        tenantId: String(tenantId),
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        users: tenantUsers,
        staff: tenantStaff,
        agents: tenantAgents,
        vehicles: tenantVehicles,
        tours: tenantTours,
        destinations: tenantDestinations,
        bookings: tenantBookings,
        payments: tenantPayments,
      });
    }

    const primary = revenueRows.find((row) => row.currency === "KES") || revenueRows[0] || null;
    return res.json({
      success: true,
      scope: { type: "platform", tenantCount: tenantRows.length },
      data: {
        users,
        customers,
        staff,
        agents,
        approvedAgents,
        pendingAgents: Math.max(0, agents - approvedAgents),
        vehicles,
        availableVehicles,
        assignedVehicles,
        maintenanceVehicles,
        bookings,
        pendingBookings,
        confirmedBookings,
        tours,
        destinations,
        payments,
        completedPayments,
        revenue: Number(primary?.revenue || 0),
        grossRevenue: Number(primary?.gross || 0),
        refundedRevenue: Number(primary?.refunds || 0),
        revenueCurrency: primary?.currency || "KES",
        revenueByCurrency: revenueRows,
        tenants,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SuperAdmin dashboard metrics error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to load platform metrics." });
  }
};
