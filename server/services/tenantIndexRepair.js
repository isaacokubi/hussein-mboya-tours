/**
 * Purpose: tenant Index Repair business-logic service. Main declarations: repairLegacyTenantUniqueIndex, createWithTenantIndexRepair, isTenantIndexConflict.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";

/**
 * Repair obsolete globally-unique indexes that conflict with the current
 * tenant-scoped data model. Repairs are lazy so existing deployments can
 * self-heal on the first affected write without a destructive migration.
 */
// Define repairLegacyTenantUniqueIndex; its parameters and body implement this operation.
export async function repairLegacyTenantUniqueIndex(Model, error) {
  // Check the condition (error?.code !== 11000) and run the matching branch.
  if (error?.code !== 11000) return false;

  // Declare keyPattern for use by the surrounding module or function.
  const keyPattern = error.keyPattern || {};
  // Declare fields for use by the surrounding module or function.
  const fields = Object.keys(keyPattern);
  // Declare modelName for use by the surrounding module or function.
  const modelName = Model?.modelName;

  // Declare isLegacyTenantIndex for use by the surrounding module or function.
  const isLegacyTenantIndex = fields.length === 1 && fields[0] === "tenantId";
  // Declare isLegacyRoleNameIndex for use by the surrounding module or function.
  const isLegacyRoleNameIndex = modelName === "Role" && fields.length === 1 && fields[0] === "name";
  // Declare isLegacyGlobalEmailIndex for use by the surrounding module or function.
  const isLegacyGlobalEmailIndex =
    ["User", "Staff"].includes(modelName) &&
    fields.length === 1 &&
    fields[0] === "email";
  // Declare isLegacyGlobalPhoneIndex for use by the surrounding module or function.
  const isLegacyGlobalPhoneIndex =
    ["User", "Staff"].includes(modelName) &&
    fields.length === 1 &&
    fields[0] === "phone";

  // Older Staff schemas accidentally made operational fields globally unique.
  // That means the first driver could be created, but a second driver would
  // fail with E11000 on position_1/role_1/status_1/etc. These fields are not
  // unique in the current Staff model and must not block additional staff.
  // Declare isLegacyStaffOperationalIndex for use by the surrounding module or function.
  const isLegacyStaffOperationalIndex =
    modelName === "Staff" &&
    fields.length === 1 &&
    ["position", "role", "status", "availability", "isDeleted"].includes(fields[0]);

  // Check the condition (!isLegacyTenantIndex && !isLegacyRoleNameIndex && !isLegacyGlobalEmail) and run the matching branch.
  if (
    !isLegacyTenantIndex &&
    !isLegacyRoleNameIndex &&
    !isLegacyGlobalEmailIndex &&
    !isLegacyGlobalPhoneIndex &&
    !isLegacyStaffOperationalIndex
  ) return false;

  // Declare collection for use by the surrounding module or function.
  const collection = Model?.collection;
  // Check the condition (!collection) and run the matching branch.
  if (!collection) return false;

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare indexes for use by the surrounding module or function.
    const indexes = await collection.listIndexes().toArray();
    // Declare legacyIndexes for use by the surrounding module or function.
    const legacyIndexes = indexes.filter((index) => {
      // Declare keys for use by the surrounding module or function.
      const keys = Object.keys(index.key || {});
      // Check the condition (index.unique !== true || keys.length !== 1) and run the matching branch.
      if (index.unique !== true || keys.length !== 1) return false;
      // Check the condition (isLegacyTenantIndex) and run the matching branch.
      if (isLegacyTenantIndex) return keys[0] === "tenantId";
      // Check the condition (isLegacyRoleNameIndex) and run the matching branch.
      if (isLegacyRoleNameIndex) return keys[0] === "name";
      // Check the condition (isLegacyGlobalEmailIndex) and run the matching branch.
      if (isLegacyGlobalEmailIndex) return keys[0] === "email";
      // Check the condition (isLegacyGlobalPhoneIndex) and run the matching branch.
      if (isLegacyGlobalPhoneIndex) return keys[0] === "phone";
      // Return the expression shown below to the caller.
      return isLegacyStaffOperationalIndex && ["position", "role", "status", "availability", "isDeleted"].includes(keys[0]);
    });

    // Check the condition (!legacyIndexes.length) and run the matching branch.
    if (!legacyIndexes.length) return false;

    // Repeat the enclosed work for each required iteration.
    for (const index of legacyIndexes) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        await collection.dropIndex(index.name);
      } catch (dropError) {
        // Check the condition (dropError?.codeName !== "IndexNotFound" && dropError?.code !== 27) and run the matching branch.
        if (dropError?.codeName !== "IndexNotFound" && dropError?.code !== 27) throw dropError;
      }
    }

    // Return the expression shown below to the caller.
    return true;
  } catch (repairError) {
    // Perform the side effect or state update expressed on the following line.
    console.error(`Failed to repair legacy index for ${modelName || "model"}:`, repairError);
    // Return the expression shown below to the caller.
    return false;
  }
}

// Define createWithTenantIndexRepair; its parameters and body implement this operation.
export async function createWithTenantIndexRepair(Model, payload) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of Model.create() operation to the caller.
    return await Model.create(payload);
  } catch (error) {
    // Declare repaired for use by the surrounding module or function.
    const repaired = await repairLegacyTenantUniqueIndex(Model, error);
    // Check the condition (!repaired) and run the matching branch.
    if (!repaired) throw error;
    // Return the result of Model.create() to the caller.
    return Model.create(payload);
  }
}

// Define isTenantIndexConflict; its parameters and body implement this operation.
export function isTenantIndexConflict(error) {
  // Check the condition (error?.code !== 11000) and run the matching branch.
  if (error?.code !== 11000) return false;
  // Declare fields for use by the surrounding module or function.
  const fields = Object.keys(error.keyPattern || {});
  // Return the expression shown below to the caller.
  return fields.length === 1 && fields[0] === "tenantId";
}

// Expose the selected declarations or re-exported members to other parts of the application.
export { mongoose };
