import mongoose from "mongoose";

const roleNameExpression = {
  $toLower: {
    $ifNull: [
      { $arrayElemAt: ["$roleDoc.name", 0] },
      { $ifNull: ["$role", "$legacyRole"] },
    ],
  },
};

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
 * their linked User. A conflicting explicit profile tenantId is not counted.
 */
export async function getCanonicalSuperAdminCustomerMetrics(db, tenantIds) {
  if (!db) throw new Error("Database connection is not ready.");

  const normalizedTenantIds = (tenantIds || []).map((id) =>
    id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
  );

  if (!normalizedTenantIds.length) return emptyMetrics();

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
            resolvedTenantId: {
              $cond: [
                { $eq: [{ $type: "$tenantId" }, "objectId"] },
                "$tenantId",
                { $arrayElemAt: ["$linkedUser.tenantId", 0] },
              ],
            },
          },
        },
        { $match: { resolvedTenantId: { $in: normalizedTenantIds } } },
        { $count: "customerProfiles" },
      ])
      .toArray(),
  ]);

  const accounts = accountResult[0] || {};
  const profiles = profileResult[0] || {};

  return {
    customerAccounts: Number(accounts.customerAccounts || 0),
    customerProfiles: Number(profiles.customerProfiles || 0),
    activeAccounts: Number(accounts.activeAccounts || 0),
    tenantAdmins: Number(accounts.tenantAdmins || 0),
  };
}

export default getCanonicalSuperAdminCustomerMetrics;
