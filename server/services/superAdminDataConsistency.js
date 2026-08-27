import mongoose from "mongoose";

const roleNameExpression = {
  $toLower: {
    $ifNull: [
      { $arrayElemAt: ["$roleDoc.name", 0] },
      { $ifNull: ["$role", "$legacyRole"] },
    ],
  },
};

/**
 * Canonical platform customer metrics used by both Super Admin pages.
 *
 * Customer account semantics mirror SuperAdmin User Management:
 * roleId.name first, then role, then legacyRole; account must be active and
 * tenant-owned. Profile counts come from CustomerProfile records linked to
 * those customer accounts. A legacy profile without tenantId is reconciled via
 * its linked user's tenantId; an explicitly conflicting tenantId is excluded.
 */
export async function getCanonicalSuperAdminCustomerMetrics(db, tenantIds) {
  if (!db) throw new Error("Database connection is not ready.");

  const normalizedTenantIds = (tenantIds || []).map((id) =>
    id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
  );

  if (!normalizedTenantIds.length) {
    return {
      customerAccounts: 0,
      customerProfiles: 0,
      activeAccounts: 0,
      tenantAdmins: 0,
    };
  }

  const [result] = await db
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
      {
        $set: {
          effectiveRole: roleNameExpression,
        },
      },
      {
        $lookup: {
          from: "customerprofiles",
          let: { userId: "$_id", userTenantId: "$tenantId" },
          pipeline: [
            {
              $match: {
                isDeleted: { $ne: true },
                isActive: { $ne: false },
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    {
                      $or: [
                        { $eq: ["$tenantId", null] },
                        { $eq: ["$tenantId", "$$userTenantId"] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: "customerProfiles",
        },
      },
      {
        $group: {
          _id: null,
          customerAccounts: {
            $sum: { $cond: [{ $eq: ["$effectiveRole", "customer"] }, 1, 0] },
          },
          customerProfiles: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$effectiveRole", "customer"] },
                    { $gt: [{ $size: "$customerProfiles" }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
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
      {
        $project: {
          _id: 0,
          customerAccounts: 1,
          customerProfiles: 1,
          activeAccounts: 1,
          tenantAdmins: 1,
        },
      },
    ])
    .toArray();

  return (
    result || {
      customerAccounts: 0,
      customerProfiles: 0,
      activeAccounts: 0,
      tenantAdmins: 0,
    }
  );
}

export default getCanonicalSuperAdminCustomerMetrics;
