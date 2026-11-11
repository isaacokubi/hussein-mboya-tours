/**
 * Purpose: super Admin Dashboard Metrics Controller HTTP controller. Main declarations: count, sum, getSuperAdminDashboardMetrics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../services/superAdminDataConsistency.js so this module can use its exported dependencies.
import getCanonicalSuperAdminCustomerMetrics from "../services/superAdminDataConsistency.js";

// Declare count for use by the surrounding module or function.
const count = async (db, collection, filter = {}) =>
  db.collection(collection).countDocuments(filter);

// Declare sum for use by the surrounding module or function.
const sum = (rows, key) =>
  rows.reduce((total, row) => total + Number(row?.[key] || 0), 0);

// Declare getSuperAdminDashboardMetrics for use by the surrounding module or function.
export const getSuperAdminDashboardMetrics = async (_req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare db for use by the surrounding module or function.
    const db = mongoose.connection.db;

    // Check the condition (!db) and run the matching branch.
    if (!db) {
      // Return the result of res.status(503).json() to the caller.
      return res.status(503).json({
        success: false,
        message: "Database connection is not ready.",
      });
    }

    // Declare tenantRows for use by the surrounding module or function.
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

    // Declare tenantIds for use by the surrounding module or function.
    const tenantIds = tenantRows.map((tenant) => tenant._id);
    // Declare tenantFilter for use by the surrounding module or function.
    const tenantFilter = tenantIds.length
      ? { tenantId: { $in: tenantIds } }
      : { tenantId: null };
    // Declare nonDeleted for use by the surrounding module or function.
    const nonDeleted = { isDeleted: { $ne: true } };
    // Declare customerMetrics for use by the surrounding module or function.
    const customerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, tenantIds);

    // Declare [ platformUsers, activePlatformUsers, suspendedPlatformUsers, blockedPlatformUsers, tenantStaff, tenantAgents, approvedAgents, tenantVehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tenantTours, tenantDestinations, tenantBookings, pendingBookings, confirmedBookings, tenantPayments, completedPayments, ] for use by the surrounding module or function.
    const [
      platformUsers,
      activePlatformUsers,
      suspendedPlatformUsers,
      blockedPlatformUsers,
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
      count(db, "users", {}),
      count(db, "users", { status: "active" }),
      count(db, "users", { status: { $in: ["suspended", "inactive", "disabled"] } }),
      count(db, "users", { status: "blocked" }),
      count(db, "staffs", { ...tenantFilter, ...nonDeleted }),
      count(db, "agents", { ...tenantFilter, ...nonDeleted }),
      count(db, "agents", {
        ...tenantFilter,
        ...nonDeleted,
        status: "active",
        isApproved: true,
      }),
      count(db, "vehicles", { ...tenantFilter, ...nonDeleted }),
      count(db, "vehicles", {
        ...tenantFilter,
        ...nonDeleted,
        status: "available",
      }),
      count(db, "vehicles", {
        ...tenantFilter,
        ...nonDeleted,
        status: "assigned",
      }),
      count(db, "vehicles", {
        ...tenantFilter,
        ...nonDeleted,
        status: "maintenance",
      }),
      count(db, "tours", tenantFilter),
      count(db, "destinations", tenantFilter),
      count(db, "bookings", tenantFilter),
      count(db, "bookings", { ...tenantFilter, status: "pending" }),
      count(db, "bookings", { ...tenantFilter, status: "confirmed" }),
      count(db, "payments", tenantFilter),
      count(db, "payments", { ...tenantFilter, status: "completed" }),
    ]);

    // Declare [revenueRows, tenantSummaries] for use by the surrounding module or function.
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
              revenue: {
                $max: [0, { $subtract: ["$gross", "$refunds"] }],
              },
            },
          },
          { $sort: { currency: 1 } },
        ])
        .toArray(),
      Promise.all(
        tenantRows.map(async (tenant) => {
          // Declare scope for use by the surrounding module or function.
          const scope = { tenantId: tenant._id };
          // Declare tenantCustomerMetrics for use by the surrounding module or function.
          const tenantCustomerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, [tenant._id]);
          // Declare [ users, tours, bookings, payments, staff, agents, vehicles, availableVehiclesForTenant, destinations, completedPaymentsForTenant, ] for use by the surrounding module or function.
          const [
            users,
            tours,
            bookings,
            payments,
            staff,
            agents,
            vehicles,
            availableVehiclesForTenant,
            destinations,
            completedPaymentsForTenant,
          ] = await Promise.all([
            count(db, "users", scope),
            count(db, "tours", scope),
            count(db, "bookings", scope),
            count(db, "payments", scope),
            count(db, "staffs", { ...scope, ...nonDeleted }),
            count(db, "agents", { ...scope, ...nonDeleted }),
            count(db, "vehicles", { ...scope, ...nonDeleted }),
            count(db, "vehicles", { ...scope, ...nonDeleted, status: "available" }),
            count(db, "destinations", scope),
            count(db, "payments", { ...scope, status: "completed" }),
          ]);

          // Return the object assembled below to the caller.
          return {
            tenantId: String(tenant._id),
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            subscription: tenant.subscription || {},
            users,
            customerProfiles: tenantCustomerMetrics.customerProfiles,
            customerAccounts: tenantCustomerMetrics.customerAccounts,
            admins: tenantCustomerMetrics.tenantAdmins,
            staff,
            agents,
            vehicles,
            availableVehicles: availableVehiclesForTenant,
            tours,
            destinations,
            bookings,
            payments,
            completedPayments: completedPaymentsForTenant,
          };
        })
      ),
    ]);

    // Declare primary for use by the surrounding module or function.
    const primary = revenueRows.find((row) => row.currency === "KES") || revenueRows[0] || null;
    // Declare tenantCount for use by the surrounding module or function.
    const tenantCount = tenantRows.length;
    // Declare activeTenantCount for use by the surrounding module or function.
    const activeTenantCount = tenantRows.filter((tenant) => tenant.status === "active").length;
    // Declare trialTenantCount for use by the surrounding module or function.
    const trialTenantCount = tenantRows.filter((tenant) => tenant.status === "trial").length;

    // Return the result of res.json() to the caller.
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
        activeUsers: activePlatformUsers,
        suspendedUsers: suspendedPlatformUsers,
        blockedUsers: blockedPlatformUsers,
        customerProfiles: customerMetrics.customerProfiles,
        customerAccounts: customerMetrics.customerAccounts,
        customers: customerMetrics.customerProfiles,
        admins: customerMetrics.tenantAdmins,
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
          tenantCustomerProfiles: sum(tenantSummaries, "customerProfiles"),
          tenantCustomerAccounts: sum(tenantSummaries, "customerAccounts"),
          tenantAdmins: sum(tenantSummaries, "admins"),
          tenantStaff: sum(tenantSummaries, "staff"),
          tenantAgents: sum(tenantSummaries, "agents"),
          tenantVehicles: sum(tenantSummaries, "vehicles"),
          tenantTours: sum(tenantSummaries, "tours"),
          tenantDestinations: sum(tenantSummaries, "destinations"),
          tenantBookings: sum(tenantSummaries, "bookings"),
          tenantPayments: sum(tenantSummaries, "payments"),
          tenantCompletedPayments: sum(tenantSummaries, "completedPayments"),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("SuperAdmin dashboard metrics error:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({
      success: false,
      message: publicErrorMessage(error, "Unable to load platform metrics."),
    });
  }
};
