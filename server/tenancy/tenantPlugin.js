/**
 * Purpose: tenant Plugin tenant-isolation module. Main declarations: requireTenantId, tenantObjectId, assertTenantValue, isPlatformOwnerDocument, mergeTenantFilter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ./context.js so this module can use its exported dependencies.
import { getTenantId, isTenantBypassed } from "./context.js";

// Declare TENANT_PATH for use by the surrounding module or function.
const TENANT_PATH = "tenantId";
// Declare GLOBAL_COLLECTIONS for use by the surrounding module or function.
const GLOBAL_COLLECTIONS = new Set(["organizations", "permissions", "currencies"]);
// Declare PLATFORM_ROLES for use by the surrounding module or function.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
// Declare TENANT_PLUGIN_MARKER for use by the surrounding module or function.
const TENANT_PLUGIN_MARKER = Symbol.for("globalTours.tenantPluginApplied");

// Define requireTenantId; its parameters and body implement this operation.
function requireTenantId() {
  // Check the condition (isTenantBypassed()) and run the matching branch.
  if (isTenantBypassed()) return null;
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = getTenantId();
  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) throw new Error("Tenant context is required for tenant-scoped data access.");
  // Check the condition (!mongoose.Types.ObjectId.isValid(tenantId)) and run the matching branch.
  if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Invalid tenant context.");
  // Return the result of String() to the caller.
  return String(tenantId);
}

// Define tenantObjectId; its parameters and body implement this operation.
function tenantObjectId(tenantId = requireTenantId()) {
  // Return the expression shown below to the caller.
  return tenantId ? new mongoose.Types.ObjectId(tenantId) : null;
}

// Define assertTenantValue; its parameters and body implement this operation.
function assertTenantValue(value, tenantId, message = "Cross-tenant write rejected.") {
  // Check the condition (value == null) and run the matching branch.
  if (value == null) return;
  // Check the condition (typeof value === "object" && !value._bsontype && (value.$eq !== undefi) and run the matching branch.
  if (typeof value === "object" && !value._bsontype && (value.$eq !== undefined || value.$in !== undefined || value.$ne !== undefined)) {
    // Declare candidate for use by the surrounding module or function.
    const candidate = value.$eq ?? value.$in;
    // Check the condition (Array.isArray(candidate)) and run the matching branch.
    if (Array.isArray(candidate)) {
      // Check the condition (candidate.some((item) => String(item) !== String(tenantId))) and run the matching branch.
      if (candidate.some((item) => String(item) !== String(tenantId))) throw new Error(message);
      // Return the result to the caller.
      return;
    }
    // Check the condition (candidate !== undefined && String(candidate) !== String(tenantId)) and run the matching branch.
    if (candidate !== undefined && String(candidate) !== String(tenantId)) throw new Error(message);
    // Return the result to the caller.
    return;
  }
  // Check the condition (String(value) !== String(tenantId)) and run the matching branch.
  if (String(value) !== String(tenantId)) throw new Error(message);
}

// Define isPlatformOwnerDocument; its parameters and body implement this operation.
function isPlatformOwnerDocument(document) {
  // Declare role for use by the surrounding module or function.
  const role = String(document?.role || document?.legacyRole || "").trim().toLowerCase();
  // Return the expression shown below to the caller.
  return PLATFORM_ROLES.has(role) && !document?.tenantId;
}

// Define mergeTenantFilter; its parameters and body implement this operation.
function mergeTenantFilter(query) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) return;
  // Declare current for use by the surrounding module or function.
  const current = query.getFilter?.() || {};
  // Check the condition (Object.prototype.hasOwnProperty.call(current, TENANT_PATH)) and run the matching branch.
  if (Object.prototype.hasOwnProperty.call(current, TENANT_PATH)) {
    // Perform the side effect or state update expressed on the following line.
    assertTenantValue(current[TENANT_PATH], tenantId, "Cross-tenant query rejected.");
  }
  // Perform the side effect or state update expressed on the following line.
  query.setQuery({ ...current, [TENANT_PATH]: tenantObjectId(tenantId) });
}

// Define enforceUpdateTenant; its parameters and body implement this operation.
function enforceUpdateTenant(update, tenantId) {
  // Check the condition (!update || !tenantId) and run the matching branch.
  if (!update || !tenantId) return;
  // Check the condition (Array.isArray(update)) and run the matching branch.
  if (Array.isArray(update)) {
    // Repeat the enclosed work for each required iteration.
    for (const stage of update) {
      // Check the condition (stage?.$replaceRoot || stage?.$replaceWith || stage?.$project) and run the matching branch.
      if (stage?.$replaceRoot || stage?.$replaceWith || stage?.$project) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("Tenant-scoped update pipelines cannot replace or project the document root.");
      }
      // Declare requestedTenant for use by the surrounding module or function.
      const requestedTenant = stage?.$set?.[TENANT_PATH] ?? stage?.$addFields?.[TENANT_PATH] ?? stage?.$setOnInsert?.[TENANT_PATH];
      // Perform the side effect or state update expressed on the following line.
      assertTenantValue(requestedTenant, tenantId);
      // Declare unset for use by the surrounding module or function.
      const unset = stage?.$unset;
      // Declare unsetPaths for use by the surrounding module or function.
      const unsetPaths = Array.isArray(unset)
        ? unset
        : typeof unset === "string"
          ? [unset]
          : Object.keys(unset || {});
      // Declare attemptsToUnset for use by the surrounding module or function.
      const attemptsToUnset = unsetPaths.includes(TENANT_PATH);
      // Check the condition (attemptsToUnset) and run the matching branch.
      if (attemptsToUnset) throw new Error("Cross-tenant tenantId removal rejected.");
    }
    // Return the result to the caller.
    return;
  }
  // Declare requestedTenant for use by the surrounding module or function.
  const requestedTenant = update.$set?.[TENANT_PATH] ?? update[TENANT_PATH] ?? update.$setOnInsert?.[TENANT_PATH];
  // Perform the side effect or state update expressed on the following line.
  assertTenantValue(requestedTenant, tenantId);
  // Perform the side effect or state update expressed on the following line.
  update.$setOnInsert ||= {};
  // Perform the side effect or state update expressed on the following line.
  update.$setOnInsert[TENANT_PATH] = tenantId;
  // Check the condition (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, T) and run the matching branch.
  if (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, TENANT_PATH)) delete update.$unset[TENANT_PATH];
  // Check the condition (Object.prototype.hasOwnProperty.call(update, TENANT_PATH)) and run the matching branch.
  if (Object.prototype.hasOwnProperty.call(update, TENANT_PATH)) delete update[TENANT_PATH];
}

// Define enforceReplacementTenant; its parameters and body implement this operation.
function enforceReplacementTenant(replacement, tenantId) {
  // Check the condition (!replacement || Array.isArray(replacement) || !tenantId) and run the matching branch.
  if (!replacement || Array.isArray(replacement) || !tenantId) return;
  // Perform the side effect or state update expressed on the following line.
  assertTenantValue(replacement[TENANT_PATH], tenantId);
  // Perform the side effect or state update expressed on the following line.
  replacement[TENANT_PATH] = tenantId;
}

// Define enforceBulkWriteTenant; its parameters and body implement this operation.
function enforceBulkWriteTenant(operations, tenantId) {
  // Check the condition (!Array.isArray(operations) || !tenantId) and run the matching branch.
  if (!Array.isArray(operations) || !tenantId) return;
  // Repeat the enclosed work for each required iteration.
  for (const operation of operations) {
    // Check the condition (operation.insertOne?.document) and run the matching branch.
    if (operation.insertOne?.document) {
      // Declare document for use by the surrounding module or function.
      const document = operation.insertOne.document;
      // Check the condition (isPlatformOwnerDocument(document)) and run the matching branch.
      if (isPlatformOwnerDocument(document)) document[TENANT_PATH] = null;
      else { assertTenantValue(document[TENANT_PATH], tenantId); document[TENANT_PATH] = tenantId; }
    }
    // Declare updateOperation for use by the surrounding module or function.
    const updateOperation = operation.updateOne || operation.updateMany || operation.replaceOne;
    // Check the condition (updateOperation) and run the matching branch.
    if (updateOperation) {
      // Perform the side effect or state update expressed on the following line.
      assertTenantValue(updateOperation.filter?.[TENANT_PATH], tenantId);
      // Perform the side effect or state update expressed on the following line.
      updateOperation.filter = { ...(updateOperation.filter || {}), [TENANT_PATH]: tenantId };
      // Check the condition (updateOperation.update) and run the matching branch.
      if (updateOperation.update) enforceUpdateTenant(updateOperation.update, tenantId);
      // Check the condition (updateOperation.replacement) and run the matching branch.
      if (updateOperation.replacement) enforceReplacementTenant(updateOperation.replacement, tenantId);
    }
    // Declare deleteOperation for use by the surrounding module or function.
    const deleteOperation = operation.deleteOne || operation.deleteMany;
    // Check the condition (deleteOperation) and run the matching branch.
    if (deleteOperation) {
      // Perform the side effect or state update expressed on the following line.
      assertTenantValue(deleteOperation.filter?.[TENANT_PATH], tenantId);
      // Perform the side effect or state update expressed on the following line.
      deleteOperation.filter = { ...(deleteOperation.filter || {}), [TENANT_PATH]: tenantId };
    }
  }
}

// Define enforceLookupStage; its parameters and body implement this operation.
function enforceLookupStage(stage, tenantId) {
  // Check the condition (!stage?.$lookup || !tenantId) and run the matching branch.
  if (!stage?.$lookup || !tenantId) return;
  // Declare lookup for use by the surrounding module or function.
  const lookup = stage.$lookup;
  // Check the condition (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase) and run the matching branch.
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;
  // Perform the side effect or state update expressed on the following line.
  lookup.pipeline ||= [];
  // Declare tenantMatch for use by the surrounding module or function.
  const tenantMatch = { [TENANT_PATH]: tenantObjectId(tenantId) };
  // Declare existingTenant for use by the surrounding module or function.
  const existingTenant = lookup.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));
  // Check the condition (existingTenant) and run the matching branch.
  if (existingTenant) {
    // Perform the side effect or state update expressed on the following line.
    assertTenantValue(existingTenant.$match[TENANT_PATH], tenantId, "Cross-tenant lookup rejected.");
    // Perform the side effect or state update expressed on the following line.
    existingTenant.$match[TENANT_PATH] = tenantMatch[TENANT_PATH];
  } else lookup.pipeline.unshift({ $match: tenantMatch });
}

// Define enforceUnionStage; its parameters and body implement this operation.
function enforceUnionStage(stage, tenantId) {
  // Check the condition (!stage?.$unionWith || !tenantId) and run the matching branch.
  if (!stage?.$unionWith || !tenantId) return;
  // Check the condition (typeof stage.$unionWith === "string") and run the matching branch.
  if (typeof stage.$unionWith === "string") {
    // Check the condition (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) and run the matching branch.
    if (GLOBAL_COLLECTIONS.has(stage.$unionWith.toLowerCase())) return;
    // Perform the side effect or state update expressed on the following line.
    stage.$unionWith = { coll: stage.$unionWith, pipeline: [{ $match: { [TENANT_PATH]: tenantObjectId(tenantId) } }] };
    // Return the result to the caller.
    return;
  }
  // Declare union for use by the surrounding module or function.
  const union = stage.$unionWith;
  // Check the condition (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase()) and run the matching branch.
  if (!union.coll || GLOBAL_COLLECTIONS.has(String(union.coll).toLowerCase())) return;
  // Perform the side effect or state update expressed on the following line.
  union.pipeline ||= [];
  // Declare existingTenant for use by the surrounding module or function.
  const existingTenant = union.pipeline.find((entry) => entry?.$match && Object.prototype.hasOwnProperty.call(entry.$match, TENANT_PATH));
  // Check the condition (existingTenant) and run the matching branch.
  if (existingTenant) {
    // Perform the side effect or state update expressed on the following line.
    assertTenantValue(existingTenant.$match[TENANT_PATH], tenantId, "Cross-tenant union rejected.");
    // Perform the side effect or state update expressed on the following line.
    existingTenant.$match[TENANT_PATH] = tenantObjectId(tenantId);
  } else union.pipeline.unshift({ $match: { [TENANT_PATH]: tenantObjectId(tenantId) } });
}

// Define enforceGraphLookupStage; its parameters and body implement this operation.
function enforceGraphLookupStage(stage, tenantId) {
  // Check the condition (!stage?.$graphLookup || !tenantId) and run the matching branch.
  if (!stage?.$graphLookup || !tenantId) return;
  // Declare lookup for use by the surrounding module or function.
  const lookup = stage.$graphLookup;
  // Check the condition (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase) and run the matching branch.
  if (!lookup.from || GLOBAL_COLLECTIONS.has(String(lookup.from).toLowerCase())) return;
  // Perform the side effect or state update expressed on the following line.
  lookup.restrictSearchWithMatch ||= {};
  // Perform the side effect or state update expressed on the following line.
  assertTenantValue(lookup.restrictSearchWithMatch[TENANT_PATH], tenantId, "Cross-tenant graph lookup rejected.");
  // Perform the side effect or state update expressed on the following line.
  lookup.restrictSearchWithMatch[TENANT_PATH] = tenantObjectId(tenantId);
}

// Define enforceNestedAggregatePipelines; its parameters and body implement this operation.
function enforceNestedAggregatePipelines(pipeline, tenantId) {
  // Repeat the enclosed work for each required iteration.
  for (const stage of pipeline || []) {
    // Perform the side effect or state update expressed on the following line.
    enforceLookupStage(stage, tenantId);
    // Perform the side effect or state update expressed on the following line.
    enforceUnionStage(stage, tenantId);
    // Perform the side effect or state update expressed on the following line.
    enforceGraphLookupStage(stage, tenantId);

    // Check the condition (stage?.$facet && typeof stage.$facet === "object") and run the matching branch.
    if (stage?.$facet && typeof stage.$facet === "object") {
      // Repeat the enclosed work for each required iteration.
      for (const nestedPipeline of Object.values(stage.$facet)) {
        // Check the condition (Array.isArray(nestedPipeline)) and run the matching branch.
        if (Array.isArray(nestedPipeline)) enforceNestedAggregatePipelines(nestedPipeline, tenantId);
      }
    }
    // Check the condition (Array.isArray(stage?.$lookup?.pipeline)) and run the matching branch.
    if (Array.isArray(stage?.$lookup?.pipeline)) enforceNestedAggregatePipelines(stage.$lookup.pipeline, tenantId);
    // Check the condition (Array.isArray(stage?.$unionWith?.pipeline)) and run the matching branch.
    if (Array.isArray(stage?.$unionWith?.pipeline)) enforceNestedAggregatePipelines(stage.$unionWith.pipeline, tenantId);
  }
}

// Define tenantPlugin; its parameters and body implement this operation.
export function tenantPlugin(schema, options = {}) {
  // Check the condition (schema[TENANT_PLUGIN_MARKER]) and run the matching branch.
  if (schema[TENANT_PLUGIN_MARKER]) return;
  // Perform the side effect or state update expressed on the following line.
  Object.defineProperty(schema, TENANT_PLUGIN_MARKER, { value: true, enumerable: false, configurable: false });
  // Check the condition (options.global === true) and run the matching branch.
  if (options.global === true) return;
  // Check the condition (!schema.path(TENANT_PATH)) and run the matching branch.
  if (!schema.path(TENANT_PATH)) schema.add({ [TENANT_PATH]: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true, immutable: true } });

  // Declare declaredIndexes for use by the surrounding module or function.
  const declaredIndexes = schema.indexes();
  // Declare singleFieldIndexes for use by the surrounding module or function.
  const singleFieldIndexes = new Set(declaredIndexes.filter(([keys]) => Object.keys(keys || {}).length === 1).map(([keys]) => Object.keys(keys)[0]));
  // Repeat the enclosed work for each required iteration.
  for (const [pathName, path] of Object.entries(schema.paths || {})) {
    // Check the condition (pathName !== TENANT_PATH && path?.options?.index === true && singleFie) and run the matching branch.
    if (pathName !== TENANT_PATH && path?.options?.index === true && singleFieldIndexes.has(pathName)) path.options.index = false;
  }
  // Repeat the enclosed work for each required iteration.
  for (const path of Object.values(schema.paths || {})) {
    // Check the condition (!path?.options?.unique || path.path === TENANT_PATH) and run the matching branch.
    if (!path?.options?.unique || path.path === TENANT_PATH) continue;
    // Declare field for use by the surrounding module or function.
    const field = path.path;
    // Declare sparse for use by the surrounding module or function.
    const sparse = Boolean(path.options.sparse);
    // Run this operation with a dedicated error-handling path for failures.
    try { schema.removeIndex({ [field]: 1 }); } catch { /* legacy Mongo index */ }
    // Perform the side effect or state update expressed on the following line.
    path.options.unique = false;
    // Perform the side effect or state update expressed on the following line.
    schema.index({ [TENANT_PATH]: 1, [field]: 1 }, { unique: true, sparse });
  }

  // Populate tenantId during validation so required tenantId paths are set
  // before Mongoose's required-field validators run. The save hook below remains
  // as a second enforcement layer for mutated documents.
  // Perform the side effect or state update expressed on the following line.
  schema.pre("validate", function tenantValidate(next) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (isPlatformOwnerDocument(this)) and run the matching branch.
      if (isPlatformOwnerDocument(this)) { this.tenantId = null; return next(); }
      // Validation-only operations (for example new Model(...).validateSync())
      // may legitimately run outside a request tenant. If a tenant context is
      // present, bind/verify it before required-field validation. Actual writes
      // remain fail-closed in the save/insertMany middleware below.
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = getTenantId();
      // Check the condition (!tenantId) and run the matching branch.
      if (!tenantId) return next();
      // Check the condition (!mongoose.Types.ObjectId.isValid(tenantId)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Invalid tenant context.");
      // Perform the side effect or state update expressed on the following line.
      assertTenantValue(this.tenantId, tenantId);
      // Check the condition (!this.tenantId) and run the matching branch.
      if (!this.tenantId) this.tenantId = tenantId;
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });

  // Perform the side effect or state update expressed on the following line.
  schema.pre("save", function tenantSave(next) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (isPlatformOwnerDocument(this)) and run the matching branch.
      if (isPlatformOwnerDocument(this)) { this.tenantId = null; return next(); }
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = requireTenantId();
      // Check the condition (!tenantId) and run the matching branch.
      if (!tenantId) return next();
      // Perform the side effect or state update expressed on the following line.
      assertTenantValue(this.tenantId, tenantId);
      // Check the condition (!this.tenantId) and run the matching branch.
      if (!this.tenantId) this.tenantId = tenantId;
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });

  // Perform the side effect or state update expressed on the following line.
  schema.pre("insertMany", function tenantInsertMany(next, docs) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = requireTenantId();
      // Check the condition (!tenantId) and run the matching branch.
      if (!tenantId) return next();
      // Repeat the enclosed work for each required iteration.
      for (const doc of docs || []) {
        // Check the condition (isPlatformOwnerDocument(doc)) and run the matching branch.
        if (isPlatformOwnerDocument(doc)) doc[TENANT_PATH] = null;
        else { assertTenantValue(doc?.[TENANT_PATH], tenantId); if (doc) doc[TENANT_PATH] = tenantId; }
      }
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });

  // Perform the side effect or state update expressed on the following line.
  ["find", "findOne", "findOneAndUpdate", "findOneAndDelete", "findOneAndReplace", "updateOne", "updateMany", "replaceOne", "deleteOne", "deleteMany", "countDocuments", "distinct"].forEach((hook) => {
    // Perform the side effect or state update expressed on the following line.
    schema.pre(hook, function tenantQuery(next) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare tenantId for use by the surrounding module or function.
        const tenantId = requireTenantId();
        // Check the condition (!tenantId) and run the matching branch.
        if (!tenantId) return next();
        // Perform the side effect or state update expressed on the following line.
        mergeTenantFilter(this);
        // Check the condition (["findOneAndUpdate", "updateOne", "updateMany"].includes(hook)) and run the matching branch.
        if (["findOneAndUpdate", "updateOne", "updateMany"].includes(hook)) enforceUpdateTenant(this.getUpdate?.(), tenantId);
        // Check the condition (["findOneAndReplace", "replaceOne"].includes(hook)) and run the matching branch.
        if (["findOneAndReplace", "replaceOne"].includes(hook)) enforceReplacementTenant(this.getUpdate?.(), tenantId);
        // Perform the side effect or state update expressed on the following line.
        next();
      } catch (error) { next(error); }
    });
  });

  // Perform the side effect or state update expressed on the following line.
  schema.pre("estimatedDocumentCount", function tenantEstimatedCount(next) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (!isTenantBypassed()) and run the matching branch.
      if (!isTenantBypassed()) { requireTenantId(); throw new Error("estimatedDocumentCount() is blocked for tenant-scoped models. Use countDocuments() instead."); }
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });

  // Perform the side effect or state update expressed on the following line.
  schema.pre("bulkWrite", function tenantBulkWrite(next, operations) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = requireTenantId();
      // Check the condition (!tenantId) and run the matching branch.
      if (!tenantId) return next();
      // Perform the side effect or state update expressed on the following line.
      enforceBulkWriteTenant(operations, tenantId);
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });

  // Perform the side effect or state update expressed on the following line.
  schema.pre("aggregate", function tenantAggregate(next) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = requireTenantId();
      // Check the condition (!tenantId) and run the matching branch.
      if (!tenantId) return next();
      // Declare pipeline for use by the surrounding module or function.
      const pipeline = this.pipeline();
      // Declare match for use by the surrounding module or function.
      const match = { [TENANT_PATH]: tenantObjectId(tenantId) };
      // Check the condition (pipeline[0]?.$geoNear) and run the matching branch.
      if (pipeline[0]?.$geoNear) {
        // Declare query for use by the surrounding module or function.
        const query = pipeline[0].$geoNear.query || {};
        // Check the condition (Object.prototype.hasOwnProperty.call(query, TENANT_PATH)) and run the matching branch.
        if (Object.prototype.hasOwnProperty.call(query, TENANT_PATH)) assertTenantValue(query[TENANT_PATH], tenantId, "Cross-tenant aggregation rejected.");
        // Perform the side effect or state update expressed on the following line.
        pipeline[0].$geoNear.query = { ...query, ...match };
      } else if (pipeline[0]?.$match) {
        // Declare existing for use by the surrounding module or function.
        const existing = pipeline[0].$match;
        // Check the condition (Object.prototype.hasOwnProperty.call(existing, TENANT_PATH)) and run the matching branch.
        if (Object.prototype.hasOwnProperty.call(existing, TENANT_PATH)) {
          // Perform the side effect or state update expressed on the following line.
          assertTenantValue(existing[TENANT_PATH], tenantId, "Cross-tenant aggregation rejected.");
          // Perform the side effect or state update expressed on the following line.
          existing[TENANT_PATH] = match[TENANT_PATH];
        } else pipeline[0] = { $match: { $and: [existing, match] } };
      } else pipeline.unshift({ $match: match });
      // Perform the side effect or state update expressed on the following line.
      enforceNestedAggregatePipelines(pipeline, tenantId);
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch (error) { next(error); }
  });
}
