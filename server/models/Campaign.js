/**
 * Purpose: Campaign database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| CAMPAIGN SCHEMA
|--------------------------------------------------------------------------
*/

// Declare campaignSchema for use by the surrounding module or function.
const campaignSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CAMPAIGN TYPE
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: [
        "email",
        "sms",
        "whatsapp",
        "push_notification",
      ],
      default: "email",
    },

    /*
    |--------------------------------------------------------------------------
    | CONTENT
    |--------------------------------------------------------------------------
    */

    subject: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    htmlContent: {
      type: String,
      default: "",
    },

    attachments: [
      {
        type: String,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | AUDIENCE
    |--------------------------------------------------------------------------
    */

    audience: {
      type: String,
      enum: [
        "all",
        "new",
        "vip",
        "regular",
        "corporate",
        "agents",
        "staff",
        "custom",
      ],
      default: "all",
    },

    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "failed",
        "cancelled",
      ],
      default: "draft",
    },

    /*
    |--------------------------------------------------------------------------
    | SCHEDULING
    |--------------------------------------------------------------------------
    */

    scheduledAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | DELIVERY STATISTICS
    |--------------------------------------------------------------------------
    */

    totalRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },

    sentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    openedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    clickedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    unsubscribedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
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
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
campaignSchema.virtual("openRate").get(function () {
  // Check the condition (!this.sentCount) and run the matching branch.
  if (!this.sentCount) return 0;

  // Return the result of Number() to the caller.
  return Number(
    ((this.openedCount / this.sentCount) * 100).toFixed(2)
  );
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.virtual("clickRate").get(function () {
  // Check the condition (!this.sentCount) and run the matching branch.
  if (!this.sentCount) return 0;

  // Return the result of Number() to the caller.
  return Number(
    ((this.clickedCount / this.sentCount) * 100).toFixed(2)
  );
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.virtual("deliveryRate").get(function () {
  // Check the condition (!this.sentCount) and run the matching branch.
  if (!this.sentCount) return 0;

  // Return the result of Number() to the caller.
  return Number(
    ((this.deliveredCount / this.sentCount) * 100).toFixed(2)
  );
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
campaignSchema.methods.markSending = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "sending";
  // Perform the side effect or state update expressed on the following line.
  this.startedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
campaignSchema.methods.markCompleted = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "sent";
  // Perform the side effect or state update expressed on the following line.
  this.completedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  audience: 1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  type: 1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  scheduledAt: 1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  createdBy: 1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
campaignSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantCampaignSchema for use by the surrounding module or function.
const tenantCampaignSchema = campaignSchema.plugin(tenantPlugin);
// Declare Campaign for use by the surrounding module or function.
const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", tenantCampaignSchema);








export default Campaign;
