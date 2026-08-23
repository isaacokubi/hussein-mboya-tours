// server/models/Permission.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const permissionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    path: {
      type: String,
      trim: true,
      default: "",
    },
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "dashboard",
        "booking",
        "tour",
        "vehicle",
        "staff",
        "customer",
        "agent",
        "payment",
        "report",
        "user",
        "role",
        "system",
        "other",
      ],
      default: "other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

permissionSchema.index({ module: 1, name: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });

permissionSchema.virtual("displayName").get(function () {
  return this.label || this.name;
});

permissionSchema.pre("save", function (next) {
  if (this.name) this.name = this.name.trim().toLowerCase();
  if (this.module) this.module = this.module.trim().toLowerCase();
  next();
});

permissionSchema.statics.getByModule = function (module) {
  return this.find({
    module: module.toLowerCase(),
    isActive: true,
  }).sort({ name: 1 });
};

// Permissions are platform-global RBAC definitions. They must not be
// tenant-filtered or have their unique name partitioned by tenant.
tenantPlugin(permissionSchema, { global: true });

const Permission =
  mongoose.models.Permission ||
  mongoose.model("Permission", permissionSchema);

export default Permission;
