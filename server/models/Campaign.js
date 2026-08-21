import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| CAMPAIGN SCHEMA
|--------------------------------------------------------------------------
*/

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

campaignSchema.virtual("openRate").get(function () {
  if (!this.sentCount) return 0;

  return Number(
    ((this.openedCount / this.sentCount) * 100).toFixed(2)
  );
});

campaignSchema.virtual("clickRate").get(function () {
  if (!this.sentCount) return 0;

  return Number(
    ((this.clickedCount / this.sentCount) * 100).toFixed(2)
  );
});

campaignSchema.virtual("deliveryRate").get(function () {
  if (!this.sentCount) return 0;

  return Number(
    ((this.deliveredCount / this.sentCount) * 100).toFixed(2)
  );
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

campaignSchema.methods.markSending = function () {
  this.status = "sending";
  this.startedAt = new Date();
  return this.save();
};

campaignSchema.methods.markCompleted = function () {
  this.status = "sent";
  this.completedAt = new Date();
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

campaignSchema.index({
  status: 1,
});

campaignSchema.index({
  audience: 1,
});

campaignSchema.index({
  type: 1,
});

campaignSchema.index({
  scheduledAt: 1,
});

campaignSchema.index({
  createdBy: 1,
});

campaignSchema.index({
  createdAt: -1,
});

campaignSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const Campaign =
  mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema);








export default Campaign;