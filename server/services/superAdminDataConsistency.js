/**
 * Purpose: super Admin Data Consistency business-logic service. Main declarations: emptyMetrics, getCanonicalSuperAdminCustomerMetrics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";

// Declare roleNameExpression for use by the surrounding module or function.
const roleNameExpression = {
  $toLower: {
    $ifNull: [
      { $arrayElemAt: ["$roleDoc.name", 0] },
      { $ifNull: ["$role", "$legacyRole"] },
    ],
  },
};

// Declare emptyMetrics for use by the surrounding module or function.
const emptyMetrics = () => ({
  customerAccounts: 0,
  customerProfiles: 0,
  activeAccounts: 0,
  tenantAdmins: 0,
});

/**
 * Canonical customer metrics shared by the two Super Admin pages.
 *
 * Customer Accounts are active tenant-owned User records whose effective role
 * matches SuperAdmin User Management (roleId.name, then role, then legacyRole).
 * Customer Profiles are active, non-deleted CustomerProfile records. Profile
 * tenantId is preferred; legacy profiles without tenantId inherit tenantId from
 * their linked User. An explicit conflicting tenantId is excluded.
 */
// Define getCanonicalSuperAdminCustomerMetrics; its parameters and body implement this operation.
export async function getCanonicalSuperAdminCustomerMetrics(db, tenantIds) {
  // Check the condition (!db) and run the matching branch.
  if (!db) throw new Error("Database connection is not ready.");

  // Declare normalizedTenantIds for use by the surrounding module or function.
  const normalizedTenantIds = (tenantIds || []).map((id) =>
    id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
  );

  // Check the condition (!normalizedTenantIds.length) and run the matching branch.
  if (!normalizedTenantIds.length) return emptyMetrics();

  // Declare [accountResult, profileResult] for use by the surrounding module or function.
  const [accountResult, profileResult] = await Promise.all([
    db
      .collection("users")
      .aggregate([
        {
          $match: {
            status: "active",
            tenantId: { $in: normalizedTenantIds },
          },
        },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleDoc",
          },
        },
        { $set: { effectiveRole: roleNameExpression } },
        {
          $group: {
            _id: null,
            customerAccounts: {
              $sum: { $cond: [{ $eq: ["$effectiveRole", "customer"] }, 1, 0] },
            },
            activeAccounts: { $sum: 1 },
            tenantAdmins: {
              $sum: {
                $cond: [
                  { $in: ["$effectiveRole", ["admin", "administrator"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 0, customerAccounts: 1, activeAccounts: 1, tenantAdmins: 1 } },
      ])
      .toArray(),
    db
      .collection("customerprofiles")
      .aggregate([
        { $match: { isDeleted: { $ne: true }, isActive: { $ne: false } } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "linkedUser",
          },
        },
        {
          $set: {
            userTenantId: { $arrayElemAt: ["$linkedUser.tenantId", 0] },
            resolvedTenantId: {
              $cond: [
                { $eq: [{ $type: "$tenantId" }, "objectId"] },
                "$tenantId",
                { $arrayElemAt: ["$linkedUser.tenantId", 0] },
              ],
            },
          },
        },
        {
          $match: {
            resolvedTenantId: { $in: normalizedTenantIds },
            $or: [
              { tenantId: { $exists: false } },
              { tenantId: null },
              { $expr: { $eq: ["$tenantId", "$userTenantId"] } },
            ],
          },
        },
        { $count: "customerProfiles" },
      ])
      .toArray(),
  ]);

  // Declare accounts for use by the surrounding module or function.
  const accounts = accountResult[0] || {};
  // Declare profiles for use by the surrounding module or function.
  const profiles = profileResult[0] || {};

  // Return the object assembled below to the caller.
  return {
    customerAccounts: Number(accounts.customerAccounts || 0),
    customerProfiles: Number(profiles.customerProfiles || 0),
    activeAccounts: Number(accounts.activeAccounts || 0),
    tenantAdmins: Number(accounts.tenantAdmins || 0),
  };
}

export default getCanonicalSuperAdminCustomerMetrics;
