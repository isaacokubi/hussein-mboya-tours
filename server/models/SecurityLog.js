import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    email: {
      type: String,
      default: "",
    },

    action: {
      type: String,
      enum: [
        "login_success",
        "login_failed",
        "password_reset",
        "account_locked",
        "logout",
        "admin_action",
        "suspicious_request"
      ],
      required: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    details: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "SecurityLog",
  securityLogSchema
);