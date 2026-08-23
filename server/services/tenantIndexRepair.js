import mongoose from "mongoose";

/**
 * Older deployments could contain globally-unique indexes on fields that are
 * now tenant-scoped. Repair those indexes lazily when an affected write is
 * attempted so admins do not have to run database migrations manually.
 */
export async function repairLegacyTenantUniqueIndex(Model, error) {
  if (error?.code !== 11000) return false;

  const keyPattern = error.keyPattern || {};
  const fields = Object.keys(keyPattern);
  const modelName = Model?.modelName;

  const isLegacyTenantIndex =
    fields.length === 1 && fields[0] === "tenantId";

  // Role.name used to be globally unique. Roles are tenant-scoped now, so
  // the old name_1 index must be removed before the new compound index can
  // enforce uniqueness correctly per tenant.
  const isLegacyRoleNameIndex =
    modelName === "Role" && fields.length === 1 && fields[0] === "name";

  if (!isLegacyTenantIndex && !isLegacyRoleNameIndex) return false;

  const collection = Model?.collection;
  if (!collection) return false;

  try {
    const indexes = await collection.listIndexes().toArray();
    const legacyIndexes = indexes.filter((index) => {
      const keys = Object.keys(index.key || {});

      if (index.unique !== true || keys.length !== 1) return false;
      if (isLegacyTenantIndex) return keys[0] === "tenantId";
      return modelName === "Role" && keys[0] === "name";
    });

    if (!legacyIndexes.length) return false;

    for (const index of legacyIndexes) {
      try {
        await collection.dropIndex(index.name);
      } catch (dropError) {
        if (dropError?.codeName !== "IndexNotFound" && dropError?.code !== 27) {
          throw dropError;
        }
      }
    }

    return true;
  } catch (repairError) {
    console.error(
      `Failed to repair legacy index for ${modelName || "model"}:`,
      repairError
    );
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
