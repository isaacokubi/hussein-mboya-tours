// server/models/SecurityLog.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| SECURITY LOG SCHEMA
|--------------------------------------------------------------------------
|
| Records authentication events, security incidents, suspicious requests,
| account activity, and administrative security actions.
|
|--------------------------------------------------------------------------
*/

const securityLogSchema = new mongoose.Schema(
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
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | EMAIL (For failed logins before user lookup)
    |--------------------------------------------------------------------------
    */

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ACTION
    |--------------------------------------------------------------------------
    */

    action: {
      type: String,
      required: true,
      enum: [
        "login_success",
        "login_failed",
        "logout",

        "password_changed",
        "password_reset",
        "password_reset_requested",

        "account_locked",
        "account_unlocked",

        "account_created",
        "account_updated",
        "account_deleted",

        "role_changed",
        "permission_changed",

        "token_revoked",

        "admin_action",

        "suspicious_request",

        "unauthorized_access",

        "file_upload",

        "api_access"
      ],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | IP ADDRESS
    |--------------------------------------------------------------------------
    */

    ipAddress: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | USER AGENT
    |--------------------------------------------------------------------------
    */

    userAgent: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | REQUEST INFORMATION
    |--------------------------------------------------------------------------
    */

    method: {
      type: String,
      default: "",
    },

    endpoint: {
      type: String,
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
        "warning"
      ],
      default: "success",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RISK LEVEL
    |--------------------------------------------------------------------------
    */

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical"
      ],
      default: "low",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | EXTRA DETAILS
    |--------------------------------------------------------------------------
    */

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
    |--------------------------------------------------------------------------
    | LOCATION
    |--------------------------------------------------------------------------
    */

    country: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
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

securityLogSchema.index({
  user: 1,
  createdAt: -1,
});

securityLogSchema.index({
  email: 1,
  createdAt: -1,
});

securityLogSchema.index({
  action: 1,
  createdAt: -1,
});

securityLogSchema.index({
  ipAddress: 1,
  createdAt: -1,
});

securityLogSchema.index({
  severity: 1,
  createdAt: -1,
});

securityLogSchema.index({
  status: 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

securityLogSchema.statics.logEvent = function ({
  user = null,
  email = "",
  action,
  ipAddress = "",
  userAgent = "",
  method = "",
  endpoint = "",
  status = "success",
  severity = "low",
  details = {},
  country = "",
  city = "",
}) {
  return this.create({
    user,
    email,
    action,
    ipAddress,
    userAgent,
    method,
    endpoint,
    status,
    severity,
    details,
    country,
    city,
  });
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const SecurityLog =
  mongoose.models.SecurityLog ||
  mongoose.model("SecurityLog", securityLogSchema);

export default SecurityLog;