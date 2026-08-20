import mongoose from "mongoose";
import { tenantPlugin } from "./tenantPlugin.js";

// Apply tenant isolation at model-compilation time. This keeps the platform
// global models (Organization, Permission and Currency) outside tenant scope
// while protecting the business models without requiring every model file to
// duplicate plugin-registration code.
const excluded = new Set(["Organization", "Permission", "Currency"]);
const originalModel = mongoose.model.bind(mongoose);

if (!mongoose.__tenantModelBootstrap) {
  mongoose.model = (name, schema, collection, options) => {
    if (schema && !excluded.has(name) && !schema.path("tenantId")) {
      schema.plugin(tenantPlugin);
    }
    return originalModel(name, schema, collection, options);
  };
  mongoose.__tenantModelBootstrap = true;
}
