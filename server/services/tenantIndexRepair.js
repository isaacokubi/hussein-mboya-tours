import mongoose from "mongoose";

/**
 * Repair obsolete globally-unique indexes that conflict with the current
 * tenant-scoped data model. Repairs are lazy so existing deployments can
 * self-heal on the first affected write without a destructive migration.
 */
export async function repairLegacyTenantUniqueIndex(Model, error) {
  if (error?.code !== 11000) return false;

  const keyPattern = error.keyPattern || {};
  const fields = Object.keys(keyPattern);
  const modelName = Model?.modelName;

  const isLegacyTenantIndex = fields.length === 1 && fields[0] === "tenantId";
  const isLegacyRoleNameIndex = modelName === "Role" && fields.length === 1 && fields[0] === "name";
  const isLegacyGlobalEmailIndex =
    ["User", "Staff"].includes(modelName) &&
    fields.length === 1 &&
    fields[0] === "email";
  const isLegacyGlobalPhoneIndex =
    ["User", "Staff"].includes(modelName) &&
    fields.length === 1 &&
    fields[0] === "phone";

  // Older Staff schemas accidentally made operational fields globally unique.
  // That means the first driver could be created, but a second driver would
  // fail with E11000 on position_1/role_1/status_1/etc. These fields are not
  // unique in the current Staff model and must not block additional staff.
  const isLegacyStaffOperationalIndex =
    modelName === "Staff" &&
    fields.length === 1 &&
    ["position", "role", "status", "availability", "isDeleted"].includes(fields[0]);

  if (
    !isLegacyTenantIndex &&
    !isLegacyRoleNameIndex &&
    !isLegacyGlobalEmailIndex &&
    !isLegacyGlobalPhoneIndex &&
    !isLegacyStaffOperationalIndex
  ) return false;

  const collection = Model?.collection;
  if (!collection) return false;

  try {
    const indexes = await collection.listIndexes().toArray();
    const legacyIndexes = indexes.filter((index) => {
      const keys = Object.keys(index.key || {});
      if (index.unique !== true || keys.length !== 1) return false;
      if (isLegacyTenantIndex) return keys[0] === "tenantId";
      if (isLegacyRoleNameIndex) return keys[0] === "name";
      if (isLegacyGlobalEmailIndex) return keys[0] === "email";
      if (isLegacyGlobalPhoneIndex) return keys[0] === "phone";
      return isLegacyStaffOperationalIndex && ["position", "role", "status", "availability", "isDeleted"].includes(keys[0]);
    });

    if (!legacyIndexes.length) return false;

    for (const index of legacyIndexes) {
      try {
        await collection.dropIndex(index.name);
      } catch (dropError) {
        if (dropError?.codeName !== "IndexNotFound" && dropError?.code !== 27) throw dropError;
      }
    }

    return true;
  } catch (repairError) {
    console.error(`Failed to repair legacy index for ${modelName || "model"}:`, repairError);
    return false;
  }
}

export async function createWithTenantIndexRepair(Model, payload) {
  try {
    return await Model.create(payload);
  } catch (error) {
    const repaired = await repairLegacyTenantUniqueIndex(Model, error);
    if (!repaired) throw error;
    return Model.create(payload);
  }
}

export function isTenantIndexConflict(error) {
  if (error?.code !== 11000) return false;
  const fields = Object.keys(error.keyPattern || {});
  return fields.length === 1 && fields[0] === "tenantId";
}

export { mongoose };
