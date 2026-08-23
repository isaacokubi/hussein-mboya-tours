// server/models/Role.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
import "./Permission.js";

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

roleSchema.virtual("permissionCount").get(function () {
  return this.permissions.length;
});

roleSchema.methods.hasPermission = function (permissionId) {
  return this.permissions.some(
    (id) => id.toString() === permissionId.toString()
  );
};

roleSchema.methods.addPermission = async function (permissionId) {
  if (!this.hasPermission(permissionId)) {
    this.permissions.push(permissionId);
    await this.save();
  }

  return this;
};

roleSchema.methods.removePermission = async function (permissionId) {
  this.permissions = this.permissions.filter(
    (id) => id.toString() !== permissionId.toString()
  );

  await this.save();

  return this;
};

tenantPlugin(roleSchema);

const Role =
  mongoose.models.Role ||
  mongoose.model("Role", roleSchema);

export default Role;
