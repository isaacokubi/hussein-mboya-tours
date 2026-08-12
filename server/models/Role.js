// server/models/Role.js

import mongoose from "mongoose";
import "./Permission.js";

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
    /*
    |--------------------------------------------------------------------------
    | ROLE NAME
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DISPLAY NAME
    |--------------------------------------------------------------------------
    */

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERMISSIONS
    |--------------------------------------------------------------------------
    */

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | SYSTEM ROLE
    |--------------------------------------------------------------------------
    |
    | Prevents accidental deletion/editing.
    |
    |--------------------------------------------------------------------------
    */

    isSystem: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },

    /*
    |--------------------------------------------------------------------------
    | ROLE LEVEL
    |--------------------------------------------------------------------------
    |
    | Higher number = Higher privilege
    |
    |--------------------------------------------------------------------------
    */

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | DEFAULT ROLE
    |--------------------------------------------------------------------------
    */

    isDefault: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

roleSchema.virtual("permissionCount").get(function () {
  return this.permissions.length;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Role =
  mongoose.models.Role ||
  mongoose.model("Role", roleSchema);

export default Role;