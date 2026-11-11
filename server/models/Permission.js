/**
 * Purpose: Permission database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Permission.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare permissionSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
permissionSchema.index({ module: 1, name: 1 });
// Perform the side effect or state update expressed on the following line.
permissionSchema.index({ category: 1 });
// Perform the side effect or state update expressed on the following line.
permissionSchema.index({ isActive: 1 });

// Perform the side effect or state update expressed on the following line.
permissionSchema.virtual("displayName").get(function () {
  // Return the expression shown below to the caller.
  return this.label || this.name;
});

// Perform the side effect or state update expressed on the following line.
permissionSchema.pre("save", function (next) {
  // Check the condition (this.name) and run the matching branch.
  if (this.name) this.name = this.name.trim().toLowerCase();
  // Check the condition (this.module) and run the matching branch.
  if (this.module) this.module = this.module.trim().toLowerCase();
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
permissionSchema.statics.getByModule = function (module) {
  // Return the result of this.find({     module: module.toLowerCase(),     isActive: true,   }).sort() to the caller.
  return this.find({
    module: module.toLowerCase(),
    isActive: true,
  }).sort({ name: 1 });
};

// Permissions are platform-global RBAC definitions. They must not be
// tenant-filtered or have their unique name partitioned by tenant.
// Perform the side effect or state update expressed on the following line.
tenantPlugin(permissionSchema, { global: true });

// Declare Permission for use by the surrounding module or function.
const Permission =
  mongoose.models.Permission ||
  mongoose.model("Permission", permissionSchema);

export default Permission;
