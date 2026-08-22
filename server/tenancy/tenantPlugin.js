import mongoose from "mongoose";
import { getTenantId, isTenantBypassed } from "./context.js";

const TENANT_PATH = "tenantId";
const GLOBAL_COLLECTIONS = new Set(["organizations", "permissions", "currencies"]);

function requireTenantId() {
  if (isTenantBypassed()) return null;
  const tenantId = getTenantId();
  if (!tenantId) throw new Error("Tenant context is required for tenant-scoped data access.");
  return tenantId;
}

function tenantObjectId() {
  const tenantId = requireTenantId();
  return tenantId ? new mongoose.Types.ObjectId(tenantId) : null;
}

function assertTenantValue(value, tenantId, message = "Cross-tenant write rejected.") {
  if (value != null && String(value) !== String(tenantId)) throw new Error(message);
}

function mergeTenantFilter(query) {
  const tenantId = requireTenantId();
  if (!tenantId) return;
  const filter = { [TENANT_PATH]: tenantObjectId() };
  const current = query.getFilter?.() || {};
  if (current[TENANT_PATH]) assertTenantValue(current[TENANT_PATH], tenantId, "Cross-tenant query rejected.");
  query.setQuery({ $and: [current, filter] });
}

function enforceUpdateTenant(update, tenantId) {
  if (!update || Array.isArray(update)) return;
  const requestedTenant = update.$set?.[TENANT_PATH] ?? update[TENANT_PATH] ?? update.$setOnInsert?.[TENANT_PATH];
  assertTenantValue(requestedTenant, tenantId);
  update.$setOnInsert ||= {};
  update.$setOnInsert[TENANT_PATH] = tenantId;
  if (update.$unset?.[TENANT_PATH]) delete update.$unset[TENANT_PATH];
  if (update[TENANT_PATH]) delete update[TENANT_PATH];
}

function enforceBulkWriteTenant(operations, tenantId) {
  if (!Array.isArray(operations)) return;
  for (const operation of operations) {
    if (operation.insertOne?.document) {
      const document = operation.insertOne.document;
      assertTenantValue(document[TENANT_PATH], tenantId);
      document[TENANT_PATH] = tenantId;
    }

    const updateOperation = operation.updateOne || operation.updateMany || operation.replaceOne;
    if (updateOperation) {
      assertTenantValue(updateOperation.filter?.[TENANT_PATH], tenantId);
      updateOperation.filter = { ...(updateOperation.filter || {}), [TENANT_PATH]: tenantId };
      if (updateOperation.update) enforceUpdateTenant(updateOperation.update, tenantId);
      if (updateOperation.replacement) {
        assertTenantValue(updateOperation.replacement[TENANT_PATH], tenantId);
        updateOperation.replacement[TENANT_PATH] = tenantId;
      }
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
  const tenantMatch = { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) };
  const firstMatch = lookup.pipeline[0]?.$match;
  if (firstMatch?.[TENANT_PATH]) {
    assertTenantValue(firstMatch[TENANT_PATH], tenantId, "Cross-tenant lookup rejected.");
    firstMatch[TENANT_PATH] = tenantMatch[TENANT_PATH];
  } else {
    lookup.pipeline.unshift({ $match: tenantMatch });
  }
}

function enforceUnionStage(stage, tenantId) {
  if (!stage?.$unionWith || !tenantId) return;
  if (typeof stage.$unionWith === "string") {
    if (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) return;
    stage.$unionWith = { coll: stage.$unionWith, pipeline: [{ $match: { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) } }] };
    return;
  }
  const union = stage.$unionWith;
  if (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase())) return;
  union.pipeline ||= [];
  union.pipeline.unshift({ $match: { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) } });
}

function enforceGraphLookupStage(stage, tenantId) {
  if (!stage?.$graphLookup || !tenantId) return;
  const lookup = stage.$graphLookup;
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;
  lookup.restrictSearchWithMatch ||= {};
  assertTenantValue(lookup.restrictSearchWithMatch[TENANT_PATH], tenantId, "Cross-tenant graph lookup rejected.");
  lookup.restrictSearchWithMatch[TENANT_PATH] = new mongoose.Types.ObjectId(tenantId);
}

export function tenantPlugin(schema) {

  // Add tenantId only when missing.
  // Existing tenantId fields must still receive isolation hooks.
  if (!schema.path(TENANT_PATH)) {
    schema.add({
      [TENANT_PATH]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
        index: true,
        immutable: true,
      },
    });
  }

  for (const path of Object.values(schema.paths || {})) {
    if (!path?.options?.unique || path.path === TENANT_PATH) continue;
    const field = path.path;
    const sparse = Boolean(path.options.sparse);
    try { schema.removeIndex({ [field]: 1 }); } catch { /* index may be defined only at MongoDB level */ }
    path.options.unique = false;
    schema.index({ [TENANT_PATH]: 1, [field]: 1 }, { unique: true, sparse });
  }

  schema.pre("save", function tenantSave(next) {
    try {
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
        assertTenantValue(doc?.[TENANT_PATH], tenantId);
        if (doc) doc[TENANT_PATH] = tenantId;
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
        if (["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"].includes(hook)) enforceUpdateTenant(this.getUpdate?.(), tenantId);
        next();
      } catch (error) { next(error); }
    });
  });

  schema.pre("estimatedDocumentCount", function tenantEstimatedCount(next) {
    try {
      if (!isTenantBypassed()) {
        requireTenantId();
        throw new Error(
          "estimatedDocumentCount() is blocked for tenant-scoped models. Use countDocuments() instead."
        );
      }

      next();

    } catch (error) {
      next(error);
    }
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
      const match = { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) };

      if (pipeline[0]?.$geoNear) {
        pipeline[0].$geoNear.query = { ...(pipeline[0].$geoNear.query || {}), ...match };
      } else if (pipeline[0]?.$match) {
        const existing = pipeline[0].$match;
        if (existing[TENANT_PATH]) {
          assertTenantValue(existing[TENANT_PATH], tenantId, "Cross-tenant aggregation rejected.");
          existing[TENANT_PATH] = match[TENANT_PATH];
        } else {
          pipeline[0] = { $match: { $and: [existing, match] } };
        }
      } else {
        pipeline.unshift({ $match: match });
      }

      for (const stage of pipeline) {
        enforceLookupStage(stage, tenantId);
        enforceUnionStage(stage, tenantId);
        enforceGraphLookupStage(stage, tenantId);
      }
      next();
    } catch (error) { next(error); }
  });
}
