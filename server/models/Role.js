/**
 * Purpose: Role database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Role.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Load ./Permission.js so this module can use its exported dependencies.
import "./Permission.js";

// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
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

// Declare roleSchema for use by the surrounding module or function.
const roleSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    isSystem: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

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
// Perform the side effect or state update expressed on the following line.
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Perform the side effect or state update expressed on the following line.
roleSchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
roleSchema.index({
  level: -1,
});

// Perform the side effect or state update expressed on the following line.
roleSchema.index({
  isSystem: 1,
});

// Perform the side effect or state update expressed on the following line.
roleSchema.index({
  isDefault: 1,
});

// Perform the side effect or state update expressed on the following line.
roleSchema.virtual("permissionCount").get(function () {
  // Return the length value to the caller.
  return this.permissions.length;
});

// Perform the side effect or state update expressed on the following line.
roleSchema.methods.hasPermission = function (permissionId) {
  // Return the result of this.permissions.some() to the caller.
  return this.permissions.some(
    (id) => id.toString() === permissionId.toString()
  );
};

// Perform the side effect or state update expressed on the following line.
roleSchema.methods.addPermission = async function (permissionId) {
  // Check the condition (!this.hasPermission(permissionId)) and run the matching branch.
  if (!this.hasPermission(permissionId)) {
    // Perform the side effect or state update expressed on the following line.
    this.permissions.push(permissionId);
    // Perform the side effect or state update expressed on the following line.
    await this.save();
  }

  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
roleSchema.methods.removePermission = async function (permissionId) {
  // Perform the side effect or state update expressed on the following line.
  this.permissions = this.permissions.filter(
    (id) => id.toString() !== permissionId.toString()
  );

  // Perform the side effect or state update expressed on the following line.
  await this.save();

  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
tenantPlugin(roleSchema);

// Declare Role for use by the surrounding module or function.
const Role =
  mongoose.models.Role ||
  mongoose.model("Role", roleSchema);

export default Role;
