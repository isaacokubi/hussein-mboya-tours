// server/models/AuditLog.js

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ACTION
    |--------------------------------------------------------------------------
    */

    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "login",
        "login_success",
        "login_failed",
        "logout",
        "create",
        "update",
        "delete",
        "restore",
        "approve",
        "reject",
        "assign",
        "payment",
        "refund",
        "download",
        "export",
        "import",
        "view",
        "other",
      ],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RESOURCE
    |--------------------------------------------------------------------------
    */

    resource: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "User",
        "Booking",
        "Tour",
        "Vehicle",
        "Staff",
        "Payment",
        "Quotation",
        "Review",
        "Wishlist",
        "Notification",
        "Role",
        "Permission",
        "Agent",
        "Dashboard",
        "System",
        "Other",
      ],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RESOURCE ID
    |--------------------------------------------------------------------------
    */

    resourceId: {
      type: String,
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "success",
        "failed",
        "warning",
      ],
      default: "success",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SEVERITY
    |--------------------------------------------------------------------------
    */

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "low",
    },

    /*
    |--------------------------------------------------------------------------
    | REQUEST DETAILS
    |--------------------------------------------------------------------------
    */

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    method: {
      type: String,
      default: "",
    },

    endpoint: {
      type: String,
      default: "",
    },

    requestId: {
      type: String,
      default: "",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | BEFORE / AFTER
    |--------------------------------------------------------------------------
    */

    oldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | EXTRA METADATA
    |--------------------------------------------------------------------------
    */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

auditLogSchema.index({
  createdAt: -1,
});

auditLogSchema.index({
  user: 1,
  createdAt: -1,
});

auditLogSchema.index({
  action: 1,
  createdAt: -1,
});

auditLogSchema.index({
  resource: 1,
  resourceId: 1,
});

auditLogSchema.index({
  status: 1,
});

auditLogSchema.index({
  severity: 1,
});

/*
|--------------------------------------------------------------------------
| STATIC LOGGER
|--------------------------------------------------------------------------
*/

auditLogSchema.statics.log = function (data) {
  return this.create(data);
};

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;