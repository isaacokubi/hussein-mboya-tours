import mongoose from "mongoose";
import { getTenantId, isTenantBypassed } from "./context.js";

const TENANT_PATH = "tenantId";
const GLOBAL_COLLECTIONS = new Set(["organizations", "permissions", "currencies"]);
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const TENANT_PLUGIN_MARKER = Symbol.for("globalTours.tenantPluginApplied");

function requireTenantId() {
  if (isTenantBypassed()) return null;
  const tenantId = getTenantId();
  if (!tenantId) throw new Error("Tenant context is required for tenant-scoped data access.");
  if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Invalid tenant context.");
  return String(tenantId);
}

function tenantObjectId(tenantId = requireTenantId()) {
  return tenantId ? new mongoose.Types.ObjectId(tenantId) : null;
}

function assertTenantValue(value, tenantId, message = "Cross-tenant write rejected.") {
  if (value == null) return;
  if (typeof value === "object" && !value._bsontype && (value.$eq !== undefined || value.$in !== undefined || value.$ne !== undefined)) {
    const candidate = value.$eq ?? value.$in;
    if (Array.isArray(candidate)) {
      if (candidate.some((item) => String(item) !== String(tenantId))) throw new Error(message);
      return;
    }
    if (candidate !== undefined && String(candidate) !== String(tenantId)) throw new Error(message);
    return;
  }
  if (String(value) !== String(tenantId)) throw new Error(message);
}

function isPlatformOwnerDocument(document) {
  const role = String(document?.role || document?.legacyRole || "").trim().toLowerCase();
  return PLATFORM_ROLES.has(role) && !document?.tenantId;
}

function mergeTenantFilter(query) {
  const tenantId = requireTenantId();
  if (!tenantId) return;
  const current = query.getFilter?.() || {};
  if (Object.prototype.hasOwnProperty.call(current, TENANT_PATH)) {
    assertTenantValue(current[TENANT_PATH], tenantId, "Cross-tenant query rejected.");
  }
  query.setQuery({ ...current, [TENANT_PATH]: tenantObjectId(tenantId) });
}

function enforceUpdateTenant(update, tenantId) {
  if (!update || !tenantId) return;
  if (Array.isArray(update)) {
    for (const stage of update) {
      const requestedTenant = stage?.$set?.[TENANT_PATH] ?? stage?.$addFields?.[TENANT_PATH] ?? stage?.$setOnInsert?.[TENANT_PATH];
      assertTenantValue(requestedTenant, tenantId);
      const unset = stage?.$unset;
      const attemptsToUnset = Array.isArray(unset) ? unset.includes(TENANT_PATH) : Boolean(unset && Object.prototype.hasOwnProperty.call(unset, TENANT_PATH));
      if (attemptsToUnset) throw new Error("Cross-tenant tenantId removal rejected.");
    }
    return;
  }
  const requestedTenant = update.$set?.[TENANT_PATH] ?? update[TENANT_PATH] ?? update.$setOnInsert?.[TENANT_PATH];
  assertTenantValue(requestedTenant, tenantId);
  update.$setOnInsert ||= {};
  update.$setOnInsert[TENANT_PATH] = tenantId;
  if (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, TENANT_PATH)) delete update.$unset[TENANT_PATH];
  if (Object.prototype.hasOwnProperty.call(update, TENANT_PATH)) delete update[TENANT_PATH];
}

function enforceReplacementTenant(replacement, tenantId) {
  if (!replacement || Array.isArray(replacement) || !tenantId) return;
  assertTenantValue(replacement[TENANT_PATH], tenantId);
  replacement[TENANT_PATH] = tenantId;
}

function enforceBulkWriteTenant(operations, tenantId) {
  if (!Array.isArray(operations) || !tenantId) return;
  for (const operation of operations) {
    if (operation.insertOne?.document) {
      const document = operation.insertOne.document;
      if (isPlatformOwnerDocument(document)) document[TENANT_PATH] = null;
      else { assertTenantValue(document[TENANT_PATH], tenantId); document[TENANT_PATH] = tenantId; }
    }
    const updateOperation = operation.updateOne || operation.updateMany || operation.replaceOne;
    if (updateOperation) {
      assertTenantValue(updateOperation.filter?.[TENANT_PATH], tenantId);
      updateOperation.filter = { ...(updateOperation.filter || {}), [TENANT_PATH]: tenantId };
      if (updateOperation.update) enforceUpdateTenant(updateOperation.update, tenantId);
      if (updateOperation.replacement) enforceReplacementTenant(updateOperation.replacement, tenantId);
    }
    const deleteOperation = operation.deleteOne || operation.deleteMany;
    if (deleteOperation) {
      assertTenantValue(deleteOperation.filter?.[TENANT_PATH], tenantId);
      deleteOperation.filter = { ...(deleteOperation.filter || {}), [TENANT_PATH]: tenantId };
    }
  }
}

function enforceLookupStage(stage, tenantId) {
  if (!stage?.$lookup || !tenantId) return;
  const lookup = stage.$lookup;
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;
  lookup.pipeline ||= [];
  const tenantMatch = { [TENANT_PATH]: tenantObjectId(tenantId) };
  const existingTenant = lookup.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));
  if (existingTenant) {
    assertTenantValue(existingTenant.$match[TENANT_PATH], tenantId, "Cross-tenant lookup rejected.");
    existingTenant.$match[TENANT_PATH] = tenantMatch[TENANT_PATH];
  } else lookup.pipeline.unshift({ $match: tenantMatch });
}

function enforceUnionStage(stage, tenantId) {
  if (!stage?.$unionWith || !tenantId) return;
  if (typeof stage.$unionWith === "string") {
    if (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) return;
    stage.$unionWith = { coll: stage.$unionWith, pipeline: [{ $match: { [TENANT_PATH]: tenantObjectId(tenantId) } }] };
    return;
  }
  const union = stage.$unionWith;
  if (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase())) return;
  union.pipeline ||= [];
  const existingTenant = union.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));
  if (existingTenant) {
    assertTenantValue(existingTenant.$match[TENANT_PATH], tenantId, "Cross-tenant union rejected.");
    existingTenant.$match[TENANT_PATH] = tenantObjectId(tenantId);
  } else union.pipeline.unshift({ $match: { [TENANT_PATH]: tenantObjectId(tenantId) } });
}

function enforceGraphLookupStage(stage, tenantId) {
  if (!stage?.$graphLookup || !tenantId) return;
  const lookup = stage.$graphLookup;
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;
  lookup.restrictSearchWithMatch ||= {};
  assertTenantValue(lookup.restrictSearchWithMatch[TENANT_PATH], tenantId, "Cross-tenant graph lookup rejected.");
  lookup.restrictSearchWithMatch[TENANT_PATH] = tenantObjectId(tenantId);
}

export function tenantPlugin(schema, options = {}) {
  if (schema[TENANT_PLUGIN_MARKER]) return;
  Object.defineProperty(schema, TENANT_PLUGIN_MARKER, { value: true, enumerable: false, configurable: false });
  if (options.global === true) return;
  if (!schema.path(TENANT_PATH)) schema.add({ [TENANT_PATH]: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true, immutable: true } });

  const declaredIndexes = schema.indexes();
  const singleFieldIndexes = new Set(declaredIndexes.filter(([keys]) => Object.keys(keys || {}).length === 1).map(([keys]) => Object.keys(keys)[0]));
  for (const [pathName, path] of Object.entries(schema.paths || {})) {
    if (pathName !== TENANT_PATH && path?.options?.index === true && singleFieldIndexes.has(pathName)) path.options.index = false;
  }
  for (const path of Object.values(schema.paths || {})) {
    if (!path?.options?.unique || path.path === TENANT_PATH) continue;
    const field = path.path;
    const sparse = Boolean(path.options.sparse);
    try { schema.removeIndex({ [field]: 1 }); } catch { /* legacy Mongo index */ }
    path.options.unique = false;
    schema.index({ [TENANT_PATH]: 1, [field]: 1 }, { unique: true, sparse });
  }

  schema.pre("save", function tenantSave(next) {
    try {
      if (isPlatformOwnerDocument(this)) { this.tenantId = null; return next(); }
      const tenantId = requireTenantId();
      if (!tenantId) return next();
      assertTenantValue(this.tenantId, tenantId);
      if (!this.tenantId) this.tenantId = tenantId;
      next();
    } catch (error) { next(error); }
  });

  schema.pre("insertMany", function tenantInsertMany(next, docs) {
    try {
      const tenantId = requireTenantId();
      if (!tenantId) return next();
      for (const doc of docs || []) {
        if (isPlatformOwnerDocument(doc)) doc[TENANT_PATH] = null;
        else { assertTenantValue(doc?.[TENANT_PATH], tenantId); if (doc) doc[TENANT_PATH] = tenantId; }
      }
      next();
    } catch (error) { next(error); }
  });

  ["find", "findOne", "findOneAndUpdate", "findOneAndDelete", "findOneAndReplace", "updateOne", "updateMany", "replaceOne", "deleteOne", "deleteMany", "countDocuments", "distinct"].forEach((hook) => {
    schema.pre(hook, function tenantQuery(next) {
      try {
        const tenantId = requireTenantId();
        if (!tenantId) return next();
        mergeTenantFilter(this);
        if (["findOneAndUpdate", "updateOne", "updateMany"].includes(hook)) enforceUpdateTenant(this.getUpdate?.(), tenantId);
        if (["findOneAndReplace", "replaceOne"].includes(hook)) enforceReplacementTenant(this.getUpdate?.(), tenantId);
        next();
      } catch (error) { next(error); }
    });
  });

  schema.pre("estimatedDocumentCount", function tenantEstimatedCount(next) {
    try {
      if (!isTenantBypassed()) { requireTenantId(); throw new Error("estimatedDocumentCount() is blocked for tenant-scoped models. Use countDocuments() instead."); }
      next();
    } catch (error) { next(error); }
  });

  schema.pre("bulkWrite", function tenantBulkWrite(next, operations) {
    try {
      const tenantId = requireTenantId();
      if (!tenantId) return next();
      enforceBulkWriteTenant(operations, tenantId);
      next();
    } catch (error) { next(error); }
  });

  schema.pre("aggregate", function tenantAggregate(next) {
    try {
      const tenantId = requireTenantId();
      if (!tenantId) return next();
      const pipeline = this.pipeline();
      const match = { [TENANT_PATH]: tenantObjectId(tenantId) };
      if (pipeline[0]?.$geoNear) {
        const query = pipeline[0].$geoNear.query || {};
        if (Object.prototype.hasOwnProperty.call(query, TENANT_PATH)) assertTenantValue(query[TENANT_PATH], tenantId, "Cross-tenant aggregation rejected.");
        pipeline[0].$geoNear.query = { ...query, ...match };
      } else if (pipeline[0]?.$match) {
        const existing = pipeline[0].$match;
        if (Object.prototype.hasOwnProperty.call(existing, TENANT_PATH)) {
          assertTenantValue(existing[TENANT_PATH], tenantId, "Cross-tenant aggregation rejected.");
          existing[TENANT_PATH] = match[TENANT_PATH];
        } else pipeline[0] = { $match: { $and: [existing, match] } };
      } else pipeline.unshift({ $match: match });
      for (const stage of pipeline) { enforceLookupStage(stage, tenantId); enforceUnionStage(stage, tenantId); enforceGraphLookupStage(stage, tenantId); }
      next();
    } catch (error) { next(error); }
  });
}
