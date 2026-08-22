import mongoose from "mongoose";
import { getTenantId, isTenantBypassed } from "./context.js";

const TENANT_PATH = "tenantId";

function shouldScope() {
  return !isTenantBypassed() && Boolean(getTenantId());
}

function tenantFilter() {
  const tenantId = getTenantId();
  if (!tenantId) return null;
  return { [TENANT_PATH]: new mongoose.Types.ObjectId(tenantId) };
}

function mergeTenantFilter(query) {
  if (!shouldScope()) return;
  const filter = tenantFilter();
  if (!filter) return;
  const current = query.getFilter?.() || {};
  if (current[TENANT_PATH] && String(current[TENANT_PATH]) !== String(filter[TENANT_PATH])) {
    throw new Error("Cross-tenant query rejected.");
  }
  query.setQuery({ $and: [current, filter] });
}

export function tenantPlugin(schema, options = {}) {
  const modelName = schema.options?.collection || schema.modelName;
  // Global mongoose.plugin passes the schema before the model exists; inspect
  // collection/model metadata where available and skip known global schemas.
  if (options.excludeModels?.includes(modelName)) return;
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

  // Convert schema-level unique fields into tenant-local unique indexes.
  // This prevents one company's booking/tour/customer identifiers from
  // colliding with another company's records while preserving uniqueness
  // inside each company.
  for (const path of schema.eachPath ? Object.values(schema.paths) : []) {
    if (!path?.options?.unique || path.path === TENANT_PATH) continue;
    const field = path.path;
    const sparse = Boolean(path.options.sparse);
    path.options.unique = false;
    schema.index({ [TENANT_PATH]: 1, [field]: 1 }, { unique: true, sparse });
  }

  schema.pre("save", function tenantSave(next) {
    if (isTenantBypassed()) return next();
    const tenantId = getTenantId();
    if (!tenantId) {
      if (this.isNew) return next(new Error(`Tenant context is required to create ${this.constructor.modelName} records.`));
      return next();
    }
    if (this.tenantId && String(this.tenantId) !== String(tenantId)) {
      return next(new Error("Cross-tenant write rejected."));
    }
    if (!this.tenantId) this.tenantId = tenantId;
    next();
  });

  schema.pre("insertMany", function tenantInsertMany(next, docs) {
    if (isTenantBypassed()) return next();
    const tenantId = getTenantId();
    if (!tenantId) return next(new Error("Tenant context is required for bulk inserts."));
    for (const doc of docs || []) {
      if (doc.tenantId && String(doc.tenantId) !== String(tenantId)) return next(new Error("Cross-tenant bulk insert rejected."));
      doc.tenantId ||= tenantId;
    }
    next();
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
    "estimatedDocumentCount",
    "distinct",
  ].forEach((hook) => {
    schema.pre(hook, function tenantQuery(next) {
      if (hook === "estimatedDocumentCount") return next();
      try {
        mergeTenantFilter(this);
        if (["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"].includes(hook) && shouldScope()) {
          const tenantId = getTenantId();
          const update = this.getUpdate?.();
          if (update && !Array.isArray(update)) {
            const requestedTenant = update.$set?.[TENANT_PATH] || update[TENANT_PATH] || update.$setOnInsert?.[TENANT_PATH];
            if (requestedTenant && String(requestedTenant) !== String(tenantId)) throw new Error("Cross-tenant write rejected.");
            update.$setOnInsert ||= {};
            update.$setOnInsert[TENANT_PATH] = tenantId;
            if (update.$unset?.[TENANT_PATH]) delete update.$unset[TENANT_PATH];
          }
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  });

  schema.pre("aggregate", function tenantAggregate(next) {
    if (!shouldScope()) return next();
    const match = { $match: tenantFilter() };
    const pipeline = this.pipeline();
    if (pipeline[0]?.$match) {
      pipeline[0] = { $match: { $and: [pipeline[0].$match, match.$match] } };
    } else {
      pipeline.unshift(match);
    }
    next();
  });
}
