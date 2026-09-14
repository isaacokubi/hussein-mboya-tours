import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
import Organization from "./Organization.js";

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
agentSchema.pre("save", async function populateAgentLocation(next) {
  try {
    if (String(this.location || "").trim() || !this.tenantId) return next();
    const organization = await Organization.findById(this.tenantId).select("address country").lean();
    const address = String(organization?.address || "").trim();
    const country = String(organization?.country || "").trim();
    this.location = [address, country].filter(Boolean).join(", ");
    return next();
  } catch (error) {
    return next(error);
  }
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

agentSchema.index({
  status: 1,
  isApproved: 1,
});

agentSchema.index({
  companyName: "text",
  location: "text",
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

agentSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.isApproved;
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const tenantAgentSchema = agentSchema.plugin(tenantPlugin);
const Agent = mongoose.models.Agent || mongoose.model("Agent", tenantAgentSchema);








export default Agent;
