/**
 * Firestore compatibility layer for callers that previously repaired MongoDB
 * unique indexes at runtime.
 *
 * Firestore does not expose MongoDB-style collection indexes through the model
 * adapter, so index repair is intentionally a no-op. Uniqueness is enforced
 * by the application's tenant-scoped lookup/creation flow instead.
 */
export async function repairLegacyTenantUniqueIndex() {
  return false;
}

export async function createWithTenantIndexRepair(Model, payload, options = {}) {
  return Model.create(payload, options);
}

export function isTenantIndexConflict(error) {
  if (error?.code !== 11000 && error?.code !== "ALREADY_EXISTS" && error?.status !== 409) return false;
  const fields = Object.keys(error.keyPattern || {});
  return fields.length === 1 && fields[0] === "tenantId";
}
