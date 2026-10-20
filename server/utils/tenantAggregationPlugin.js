// Import Mongoose so tenant identifiers can be converted into ObjectIds.
import mongoose from "mongoose";
// Read the active request's tenant and explicit bypass state.
import { getTenantContext } from "../tenancy/context.js";

// Add a tenant match stage to aggregation pipelines for tenant-scoped queries.
export default function tenantAggregationPlugin(schema) {
  // Run this hook before Mongoose executes an aggregation pipeline.
  schema.pre("aggregate", function (next) {
    try {
      // Get the tenant context attached to the current asynchronous request.
      const context = getTenantContext();

      // Enforce tenant matching only when a tenant is present and no authorized bypass is active.
      if (
        context &&
        context.tenantId &&
        !context.bypass
      ) {
        // Read the aggregation pipeline that will be sent to MongoDB.
        const pipeline = this.pipeline();

        // Check whether an existing first-level match already specifies tenantId.
        const exists = pipeline.some(
          stage =>
            stage.$match && // Only inspect match stages.
            stage.$match.tenantId // Check for an explicit tenant filter.
        );

        // Add a tenant filter only when the pipeline does not already include one.
        if (!exists) {
          // Insert the tenant constraint at the beginning so downstream stages see scoped records.
          pipeline.unshift({
            $match: {
              tenantId:
                new mongoose.Types.ObjectId(
                  context.tenantId // Convert the active tenant identifier to MongoDB ObjectId format.
                )
            }
          });
        }
      }

      // Continue aggregation execution after the tenant guard has been applied.
      next();
    }
    catch (error) {
      // Forward errors to Mongoose so the operation fails instead of bypassing the guard.
      next(error);
    }
  });
}
