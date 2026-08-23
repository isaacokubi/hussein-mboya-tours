import mongoose from "mongoose";

/**
 * Older deployments could contain a globally-unique tenantId_1 index on a
 * tenant-scoped collection. That index is invalid because one tenant owns
 * many users/staff/agents/roles. Repair it lazily when an affected write is
 * attempted so the admin does not have to know or run a database migration.
 */
export async function repairLegacyTenantUniqueIndex(Model, error) {
  if (error?.code !== 11000) return false;

  const keyPattern = error.keyPattern || {};
  const fields = Object.keys(keyPattern);
  if (fields.length !== 1 || fields[0] !== "tenantId") return false;

  const collection = Model?.collection;
  if (!collection) return false;

  try {
    const indexes = await collection.listIndexes().toArray();
    const legacyIndexes = indexes.filter((index) => {
      const keys = Object.keys(index.key || {});
      return index.unique === true && keys.length === 1 && keys[0] === "tenantId";
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
    // Do not hide the original duplicate-key problem if the repair itself
    // cannot be completed. The caller will return the normal API error.
    console.error(`Failed to repair legacy tenantId index for ${Model?.modelName || "model"}:`, repairError);
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

// Keep mongoose available to callers that use this helper in scripts without
// importing it separately.
export { mongoose };
