import mongoose from "mongoose";

const count = async (db, collection, filter = {}) =>
  db.collection(collection).countDocuments(filter);

const sum = (rows, key) =>
  rows.reduce((total, row) => total + Number(row?.[key] || 0), 0);

export const getSuperAdminDashboardMetrics = async (_req, res) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database connection is not ready.",
      });
    }

    const tenantRows = await db
      .collection("organizations")
      .find({ status: { $in: ["active", "trial"] } })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        status: 1,
        createdAt: 1,
        subscription: 1,
      })
      .sort({ createdAt: 1 })
      .toArray();

    const tenantIds = tenantRows.map((tenant) => tenant._id);
    const tenantFilter = tenantIds.length ? { tenantId: { $in: tenantIds } } : { tenantId: null };
    const nonDeleted = { isDeleted: { $ne: true } };

    const [
      platformUsers,
      activeCustomers,
      tenantAdmins,
      tenantStaff,
      tenantAgents,
      approvedAgents,
      tenantVehicles,
      availableVehicles,
      assignedVehicles,
      maintenanceVehicles,
      tenantTours,
      tenantDestinations,
      tenantBookings,
      pendingBookings,
      confirmedBookings,
      tenantPayments,
      completedPayments,
    ] = await Promise.all([
      count(db, "users", { status: { $ne: "blocked" } }),
      count(db, "customers", { ...tenantFilter, ...nonDeleted, status: "active" }),
      count(db, "users", {
        ...tenantFilter,
        role: { $in: ["admin", "administrator"] },
        status: "active",
      }),
      count(db, "staffs", { ...tenantFilter, ...nonDeleted }),
      count(db, "agents", { ...tenantFilter, ...nonDeleted }),
      count(db, "agents", {
        ...tenantFilter,
        ...nonDeleted,
        status: "active",
        isApproved: true,
      }),
      count(db, "vehicles", { ...tenantFilter, ...nonDeleted }),
      count(db, "vehicles", { ...tenantFilter, ...nonDeleted, status: "available" }),
      count(db, "vehicles", { ...tenantFilter, ...nonDeleted, status: "assigned" }),
      count(db, "vehicles", { ...tenantFilter, ...nonDeleted, status: "maintenance" }),
      count(db, "tours", { ...tenantFilter, ...nonDeleted }),
      count(db, "destinations", { ...tenantFilter, ...nonDeleted }),
      count(db, "bookings", { ...tenantFilter, ...nonDeleted }),
      count(db, "bookings", { ...tenantFilter, ...nonDeleted, status: "pending" }),
      count(db, "bookings", { ...tenantFilter, ...nonDeleted, status: "confirmed" }),
      count(db, "payments", tenantFilter),
      count(db, "payments", { ...tenantFilter, status: "completed" }),
    ]);

    const [revenueRows, tenantSummaries] = await Promise.all([
      db
        .collection("payments")
        .aggregate([
          { $match: { ...tenantFilter, status: "completed" } },
          {
            $project: {
              currency: { $toUpper: { $ifNull: ["$currency", "KES"] } },
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
              _id: "$currency",
              gross: { $sum: "$amount" },
              refunds: { $sum: "$refundedAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              currency: "$_id",
              gross: 1,
              refunds: 1,
              revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
            },
          },
          { $sort: { currency: 1 } },
        ])
        .toArray(),
      Promise.all(
        tenantRows.map(async (tenant) => {
          const scope = { tenantId: tenant._id };
          return {
            tenantId: String(tenant._id),
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            subscription: tenant.subscription || {},
            users: await count(db, "users", scope),
            tours: await count(db, "tours", { ...scope, ...nonDeleted }),
            bookings: await count(db, "bookings", { ...scope, ...nonDeleted }),
            payments: await count(db, "payments", scope),
            customers: await count(db, "customers", { ...scope, ...nonDeleted, status: "active" }),
            agents: await count(db, "agents", { ...scope, ...nonDeleted }),
            staff: await count(db, "staffs", { ...scope, ...nonDeleted }),
            vehicles: await count(db, "vehicles", { ...scope, ...nonDeleted }),
            availableVehicles: await count(db, "vehicles", { ...scope, ...nonDeleted, status: "available" }),
            destinations: await count(db, "destinations", { ...scope, ...nonDeleted }),
          };
        })
      ),
    ]);

    const primary = revenueRows.find((row) => row.currency === "KES") || revenueRows[0] || null;
    const tenantCount = tenantRows.length;
    const activeTenantCount = tenantRows.filter((tenant) => tenant.status === "active").length;
    const trialTenantCount = tenantRows.filter((tenant) => tenant.status === "trial").length;

    return res.json({
      success: true,
      scope: {
        type: "platform",
        tenantCount,
        activeTenantCount,
        trialTenantCount,
      },
      data: {
        users: platformUsers,
        customers: activeCustomers,
        admins: tenantAdmins,
        staff: tenantStaff,
        agents: tenantAgents,
        approvedAgents,
        pendingAgents: Math.max(0, tenantAgents - approvedAgents),
        vehicles: tenantVehicles,
        availableVehicles,
        assignedVehicles,
        maintenanceVehicles,
        tours: tenantTours,
        destinations: tenantDestinations,
        bookings: tenantBookings,
        pendingBookings,
        confirmedBookings,
        payments: tenantPayments,
        completedPayments,
        revenue: Number(primary?.revenue || 0),
        grossRevenue: Number(primary?.gross || 0),
        refundedRevenue: Number(primary?.refunds || 0),
        revenueCurrency: primary?.currency || "KES",
        revenueByCurrency: revenueRows,
        tenants: tenantSummaries,
        consistency: {
          tenantUsers: sum(tenantSummaries, "users"),
          tenantCustomers: sum(tenantSummaries, "customers"),
          tenantStaff: sum(tenantSummaries, "staff"),
          tenantAgents: sum(tenantSummaries, "agents"),
          tenantVehicles: sum(tenantSummaries, "vehicles"),
          tenantTours: sum(tenantSummaries, "tours"),
          tenantDestinations: sum(tenantSummaries, "destinations"),
          tenantBookings: sum(tenantSummaries, "bookings"),
          tenantPayments: sum(tenantSummaries, "payments"),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SuperAdmin dashboard metrics error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load platform metrics.",
    });
  }
};
