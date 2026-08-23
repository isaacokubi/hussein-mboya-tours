import mongoose from "mongoose";
import { tenantPlugin } from "./tenantPlugin.js";

const excluded = new Set([
  "Organization",
  "Permission",
  "Currency"
]);

if (!mongoose.__tenantBootstrapApplied) {

  mongoose.plugin((schema, options) => {

    const modelName = options?.collection || schema.options?.collection;

    if (!modelName) return;

    if (excluded.has(modelName)) return;

    if (!schema.path("tenantId")) return;

    schema.plugin(tenantPlugin);

  });

  mongoose.__tenantBootstrapApplied = true;

}
