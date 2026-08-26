import mongoose from "mongoose";

const count = async (db, collection, filter = {}) =>
  db.collection(collection).countDocuments(filter);

const tenantCount = async (db, tenants, collection, extra = {}) => {
  if (!tenants.length) return 0;
  const counts = await Promise.all(
    tenants.map((tenant) =>
      count(db, collection, {
        tenantId: tenant._id,
        ...extra,
      })
    )
  );
  return counts.reduce((sum, value) => sum + value, 0);
};

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

    const activeTenantRows = tenantRows.filter(
      (tenant) => tenant.status === "active"
    );
    const trialTenantRows = tenantRows.filter(
      (tenant) => tenant.status === "trial"
    );

    const tenantScopeCount = (collection, extra = {}) =>
      tenantCount(db, tenantRows, collection, extra);

    const [
      users,
      customers,
      admins,
      staff,
      agents,
      approvedAgents,
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
    ] = await Promise.all([
      tenantScopeCount("users", {
        status: { $ne: "blocked" },
      }),

      tenantScopeCount("users", {
        role: "customer",
        status: "active",
      }),

      tenantScopeCount("users", {
        role: { $in: ["admin", "administrator"] },
        status: "active",
      }),

      tenantScopeCount("staffs", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("agents", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("agents", {
        isDeleted: { $ne: true },
        status: "active",
        isApproved: true,
      }),

      tenantScopeCount("vehicles", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("vehicles", {
        isDeleted: { $ne: true },
        status: "available",
      }),

      tenantScopeCount("vehicles", {
        isDeleted: { $ne: true },
        status: "assigned",
      }),

      tenantScopeCount("vehicles", {
        isDeleted: { $ne: true },
        status: "maintenance",
      }),

      tenantScopeCount("tours", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("destinations", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("bookings", {
        isDeleted: { $ne: true },
      }),

      tenantScopeCount("bookings", {
        isDeleted: { $ne: true },
        status: "pending",
      }),

      tenantScopeCount("bookings", {
        isDeleted: { $ne: true },
        status: "confirmed",
      }),

      tenantScopeCount("payments"),

      tenantScopeCount("payments", {
        status: "completed",
      }),
    ]);

    const revenueRows = await db
      .collection("payments")
      .aggregate([
        {
          $match: {
            tenantId: { $in: tenantRows.map((tenant) => tenant._id) },
            status: "completed",
          },
        },
        {
          $project: {
            currency: {
              $toUpper: {
                $ifNull: ["$currency", "KES"],
              },
            },
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
            revenue: {
              $max: [
                0,
                {
                  $subtract: ["$gross", "$refunds"],
                },
              ],
            },
          },
        },
        { $sort: { currency: 1 } },
      ])
      .toArray();

    const tenants = await Promise.all(
      tenantRows.map(async (tenant) => {
        const scope = { tenantId: tenant._id };

        const [
          tenantUsers,
          tenantCustomers,
          tenantAdmins,
          tenantStaff,
          tenantAgents,
          tenantVehicles,
          tenantAvailableVehicles,
          tenantTours,
          tenantDestinations,
          tenantBookings,
          tenantPayments,
        ] = await Promise.all([
          count(db, "users", scope),
          count(db, "users", {
            ...scope,
            role: "customer",
            status: "active",
          }),
          count(db, "users", {
            ...scope,
            role: { $in: ["admin", "administrator"] },
            status: "active",
          }),
          count(db, "staffs", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "agents", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "vehicles", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "vehicles", {
            ...scope,
            isDeleted: { $ne: true },
            status: "available",
          }),
          count(db, "tours", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "destinations", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "bookings", {
            ...scope,
            isDeleted: { $ne: true },
          }),
          count(db, "payments", scope),
        ]);

        return {
          tenantId: String(tenant._id),
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          subscription: tenant.subscription || {},
          users: tenantUsers,
          customers: tenantCustomers,
          admins: tenantAdmins,
          staff: tenantStaff,
          agents: tenantAgents,
          vehicles: tenantVehicles,
          availableVehicles: tenantAvailableVehicles,
          tours: tenantTours,
          destinations: tenantDestinations,
          bookings: tenantBookings,
          payments: tenantPayments,
        };
      })
    );

    const primary =
      revenueRows.find((row) => row.currency === "KES") ||
      revenueRows[0] ||
      null;

    return res.json({
      success: true,
      scope: {
        type: "platform",
        tenantCount: tenantRows.length,
        activeTenantCount: activeTenantRows.length,
        trialTenantCount: trialTenantRows.length,
      },
      data: {
        users,
        customers,
        admins,
        staff,
        agents,
        approvedAgents,
        pendingAgents: Math.max(0, agents - approvedAgents),

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

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to load platform metrics.",
    });
  }
};
