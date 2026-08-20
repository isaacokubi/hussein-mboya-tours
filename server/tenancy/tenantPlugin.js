import mongoose from "mongoose";
import { getTenantId, isTenantBypassed } from "./context.js";

const TENANT_PATH = "tenantId";
const GLOBAL_COLLECTIONS = new Set(["organizations", "permissions", "currencies"]);

function shouldScope() {
  return !isTenantBypassed() && Boolean(getTenantId());
}

function tenantFilter() {
  const tenantId = getTenantId();
  return tenantId ? { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) } : null;
}

function mergeTenantFilter(query) {
  if (!shouldScope()) return;

  const filter = tenantFilter();
  const current = query.getFilter?.() || {};

  if (
    current[TENANT_PATH] &&
    String(current[TENANT_PATH]) !== String(filter[TENANT_PATH])
  ) {
    throw new Error("Cross-tenant query rejected.");
  }

  query.setQuery({ $and: [current, filter] });
}

function assertTenantValue(value, tenantId, message = "Cross-tenant write rejected.") {
  if (value != null && String(value) !== String(tenantId)) {
    throw new Error(message);
  }
}

function enforceUpdateTenant(update, tenantId) {
  if (!update || Array.isArray(update)) return;

  const requestedTenant =
    update.$set?.[TENANT_PATH] ??
    update[TENANT_PATH] ??
    update.$setOnInsert?.[TENANT_PATH];

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

    const updateOperation =
      operation.updateOne || operation.updateMany || operation.replaceOne;

    if (updateOperation) {
      if (updateOperation.filter?.[TENANT_PATH]) {
        assertTenantValue(updateOperation.filter[TENANT_PATH], tenantId);
      }
      updateOperation.filter = {
        ...(updateOperation.filter || {}),
        [TENANT_PATH]: tenantId,
      };
      if (updateOperation.update) enforceUpdateTenant(updateOperation.update, tenantId);
      if (updateOperation.replacement) {
        assertTenantValue(updateOperation.replacement[TENANT_PATH], tenantId);
        updateOperation.replacement[TENANT_PATH] = tenantId;
      }
    }

    const deleteOperation = operation.deleteOne || operation.deleteMany;
    if (deleteOperation) {
      if (deleteOperation.filter?.[TENANT_PATH]) {
        assertTenantValue(deleteOperation.filter[TENANT_PATH], tenantId);
      }
      deleteOperation.filter = {
        ...(deleteOperation.filter || {}),
        [TENANT_PATH]: tenantId,
      };
    }
  }
}

function enforceLookupStage(stage, tenantId) {
  if (!stage?.$lookup || !shouldScope()) return;

  const lookup = stage.$lookup;
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;

  const tenantMatch = { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) };
  lookup.pipeline ||= [];

  const firstMatch = lookup.pipeline[0]?.$match;
  if (firstMatch?.[TENANT_PATH]) {
    assertTenantValue(firstMatch[TENANT_PATH], tenantId, "Cross-tenant lookup rejected.");
    firstMatch[TENANT_PATH] = tenantMatch[TENANT_PATH];
  } else {
    lookup.pipeline.unshift({ $match: tenantMatch });
  }
}

function enforceUnionStage(stage, tenantId) {
  if (!stage?.$unionWith || !shouldScope()) return;

  if (typeof stage.$unionWith === "string") {
    if (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) return;
    stage.$unionWith = {
      coll: stage.$unionWith,
      pipeline: [{ $match: { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) } }],
    };
    return;
  }

  const union = stage.$unionWith;
  if (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase())) return;
  union.pipeline ||= [];
  union.pipeline.unshift({
    $match: { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) },
  });
}

function enforceGraphLookupStage(stage, tenantId) {
  if (!stage?.$graphLookup || !shouldScope()) return;

  const lookup = stage.$graphLookup;
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;

  lookup.restrictSearchWithMatch ||= {};
  const existing = lookup.restrictSearchWithMatch[TENANT_PATH];
  assertTenantValue(existing, tenantId, "Cross-tenant graph lookup rejected.");
  lookup.restrictSearchWithMatch[TENANT_PATH] = new mongoose.Types.ObjectId(tenantId);
}

export function tenantPlugin(schema) {
  if (schema.path(TENANT_PATH)) return;

  schema.add({
    [TENANT_PATH]: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
      immutable: true,
    },
  });

  // Replace path-level global unique indexes with tenant-scoped compound indexes.
  // This also prevents a fresh deployment from recreating the old global unique index.
  for (const path of Object.values(schema.paths || {})) {
    if (!path?.options?.unique || path.path === TENANT_PATH) continue;

    const field = path.path;
    const sparse = Boolean(path.options.sparse);
    schema.removeIndex({ [field]: 1 });
    path.options.unique = false;
    schema.index(
      { [TENANT_PATH]: 1, [field]: 1 },
      { unique: true, sparse }
    );
  }

  schema.pre("save", function tenantSave(next) {
    if (isTenantBypassed()) return next();

    const tenantId = getTenantId();
    if (!tenantId) {
      return this.isNew
        ? next(new Error(`Tenant context is required to create ${this.constructor.modelName} records.`))
        : next();
    }

    assertTenantValue(this.tenantId, tenantId);
    if (!this.tenantId) this.tenantId = tenantId;
    next();
  });

  schema.pre("insertMany", function tenantInsertMany(next, docs) {
    if (!shouldScope()) return next();

    try {
      const tenantId = getTenantId();
      for (const doc of docs || []) {
        assertTenantValue(doc?.[TENANT_PATH], tenantId);
        if (doc) doc[TENANT_PATH] = tenantId;
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  [
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "findOneAndReplace",
    "updateOne",
    "updateMany",
    "replaceOne",
    "deleteOne",
    "deleteMany",
    "countDocuments",
    "distinct",
  ].forEach((hook) => {
    schema.pre(hook, function tenantQuery(next) {
      try {
        mergeTenantFilter(this);

        if (
          ["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"].includes(hook) &&
          shouldScope()
        ) {
          enforceUpdateTenant(this.getUpdate?.(), getTenantId());
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  });

  schema.pre("estimatedDocumentCount", function tenantEstimatedCount(next) {
    if (shouldScope()) {
      return next(
        new Error("estimatedDocumentCount() is not tenant-safe. Use countDocuments() instead.")
      );
    }
    next();
  });

  schema.pre("bulkWrite", function tenantBulkWrite(next, operations) {
    if (!shouldScope()) return next();

    try {
      enforceBulkWriteTenant(operations, getTenantId());
      next();
    } catch (error) {
      next(error);
    }
  });

  schema.pre("aggregate", function tenantAggregate(next) {
    if (!shouldScope()) return next();

    try {
      const tenantId = getTenantId();
      const pipeline = this.pipeline();
      const match = { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) };

      // $geoNear must remain the first stage. Its query filter can carry tenant scope.
      if (pipeline[0]?.$geoNear) {
        pipeline[0].$geoNear.query = {
          ...(pipeline[0].$geoNear.query || {}),
          ...match,
        };
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
    } catch (error) {
      next(error);
    }
  });
}
