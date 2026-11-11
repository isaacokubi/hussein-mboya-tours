/**
 * Purpose: Agent database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Load ./Organization.js so this module can use its exported dependencies.
import Organization from "./Organization.js";

// Declare agentSchema for use by the surrounding module or function.
const agentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    /*
    |--------------------------------------------------------------------------
    | LINKED USER ACCOUNT
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    /*
    |--------------------------------------------------------------------------
    | BUSINESS INFORMATION
    |--------------------------------------------------------------------------
    */

    companyName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      maxlength: 1000,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | COMMISSION
    |--------------------------------------------------------------------------
    */

    commissionRate: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },

    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | WALLET
    |--------------------------------------------------------------------------
    */

    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | SALES
    |--------------------------------------------------------------------------
    */

    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    successfulBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancelledBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | APPROVAL
    |--------------------------------------------------------------------------
    */

    isApproved: {
      type: Boolean,
      default: false,

    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

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
        "suspended",
      ],
      default: "active",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL DOCUMENTS
    |--------------------------------------------------------------------------
    */

    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    taxNumber: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
|--------------------------------------------------------------------------
| LOCATION FALLBACK
|--------------------------------------------------------------------------
| Agent accounts created from a normal user account do not necessarily carry
| a separate business location. Resolve the tenant's configured address/country
| when the profile is first created or saved, so agent management never loses
| the operational location simply because the account was user-created.
|--------------------------------------------------------------------------
*/
// Perform the side effect or state update expressed on the following line.
agentSchema.pre("save", async function populateAgentLocation(next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (String(this.location || "").trim() || !this.tenantId) and run the matching branch.
    if (String(this.location || "").trim() || !this.tenantId) return next();
    // Declare organization for use by the surrounding module or function.
    const organization = await Organization.findById(this.tenantId).select("address country").lean();
    // Declare address for use by the surrounding module or function.
    const address = String(organization?.address || "").trim();
    // Declare country for use by the surrounding module or function.
    const country = String(organization?.country || "").trim();
    // Perform the side effect or state update expressed on the following line.
    this.location = [address, country].filter(Boolean).join(", ");
    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
agentSchema.index({
  status: 1,
  isApproved: 1,
});

// Perform the side effect or state update expressed on the following line.
agentSchema.index({
  companyName: "text",
  location: "text",
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
agentSchema.virtual("isActive").get(function () {
  // Return the expression shown below to the caller.
  return this.status === "active" && this.isApproved;
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantAgentSchema for use by the surrounding module or function.
const tenantAgentSchema = agentSchema.plugin(tenantPlugin);
// Declare Agent for use by the surrounding module or function.
const Agent = mongoose.models.Agent || mongoose.model("Agent", tenantAgentSchema);








export default Agent;
