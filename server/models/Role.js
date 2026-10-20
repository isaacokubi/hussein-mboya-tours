// server/models/Role.js

// Import Mongoose to define role documents and validation.
import mongoose from "mongoose";
// Import the tenant-aware aggregation helper for role reporting pipelines.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Register the Permission model before this schema references it by name.
import "./Permission.js";

// Apply tenant scoping so roles and permissions are isolated per organization.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
/*
|--------------------------------------------------------------------------
| ROLE SCHEMA
|--------------------------------------------------------------------------
|
| Defines application roles used by the RBAC system.
|
| Examples:
| - Super Admin
| - Admin
| - Tour Manager
| - Guide
| - Driver
| - Travel Agent
| - Customer
|
|--------------------------------------------------------------------------
*/

// Define the role schema used by role-based access control (RBAC).
const roleSchema = new mongoose.Schema(
  {

    // Organization that owns this role; optional for supported platform-wide roles.
    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

    // Normalized machine-readable role name used in permission checks.
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Human-readable role label shown in administration screens.
    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional explanation of the role and its intended responsibilities.
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // References to permission records granted to users assigned this role.
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    // Protects built-in roles from workflows that should only change custom roles.
    isSystem: {
      type: Boolean,
      default: false,
    },

    // Enables or disables the role without deleting its audit history.
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },

    // Relative role level used by interfaces or hierarchy rules.
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Marks the role selected by default during supported account setup.
    isDefault: {
      type: Boolean,
      default: false,
    },

    // User who created the role, when known.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Role names are unique per tenant, not globally. A legacy global name_1
// index must be removed during the tenant-index reconciliation.
// Enforce role-name uniqueness within each tenant instead of across all tenants.
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

roleSchema.index({
  status: 1,
});

roleSchema.index({
  level: -1,
});

roleSchema.index({
  isSystem: 1,
});

roleSchema.index({
  isDefault: 1,
});

// Expose the number of assigned permissions without storing a redundant count.
roleSchema.virtual("permissionCount").get(function () {
  return this.permissions.length;
});

// Check whether this role already grants the supplied permission ID.
roleSchema.methods.hasPermission = function (permissionId) {
  return this.permissions.some(
    (id) => id.toString() === permissionId.toString()
  );
};

// Add a permission only when absent, then persist the changed role.
roleSchema.methods.addPermission = async function (permissionId) {
  if (!this.hasPermission(permissionId)) {
    this.permissions.push(permissionId);
    await this.save();
  }

  return this;
};

// Remove the requested permission ID and persist the role.
roleSchema.methods.removePermission = async function (permissionId) {
  this.permissions = this.permissions.filter(
    (id) => id.toString() !== permissionId.toString()
  );

  await this.save();

  return this;
};

// Attach tenant query/write isolation before registering the model.
tenantPlugin(roleSchema);

const Role =
  mongoose.models.Role ||
  mongoose.model("Role", roleSchema);

// Export the model for authorization middleware and role administration routes.
export default Role;
