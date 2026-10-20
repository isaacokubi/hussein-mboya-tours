// Import Mongoose, which owns model registration and global plugin hooks.
import mongoose from "mongoose";
// Import the plugin that enforces tenant isolation on model operations.
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";

// Remember whether the plugin has already been registered in this process.
let loaded = false;

// Register the tenant isolation plugin once during server initialization.
export default function loadTenantPlugin() {
  // Avoid registering the same global plugin more than once.
  if (loaded) {
    // Exit early because the global hook is already installed.
    return;
  }

  // Register tenant isolation before application models are initialized.
  mongoose.plugin(
    tenantIsolationPlugin // Hook Mongoose model operations through the tenant-safety plugin.
  );

  // Record successful registration so later calls become no-ops.
  loaded = true;

  // Emit a startup diagnostic confirming the global safety hook is installed.
  console.log("✅ Global tenant isolation plugin loaded");
}
