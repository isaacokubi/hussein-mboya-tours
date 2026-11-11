/**
 * Purpose: Tour Report database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/TourReport.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

// Declare imageSchema for use by the surrounding module or function.
const imageSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| TOUR REPORT SCHEMA
|--------------------------------------------------------------------------
*/

// Declare tourReportSchema for use by the surrounding module or function.
const tourReportSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | TOUR INFORMATION
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REPORT
    |--------------------------------------------------------------------------
    */

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    issues: [
      {
        type: String,
        trim: true,
      },
    ],

    recommendations: [
      {
        type: String,
        trim: true,
      },
    ],

    customerFeedback: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | TOUR STATISTICS
    |--------------------------------------------------------------------------
    */

    participants: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedSuccessfully: {
      type: Boolean,
      default: true,
    },

    guideRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | IMAGES
    |--------------------------------------------------------------------------
    */

    images: [imageSchema],

    /*
    |--------------------------------------------------------------------------
    | APPROVAL
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "approved",
        "rejected",
      ],
      default: "draft",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | COMPLETION
    |--------------------------------------------------------------------------
    */

    completedAt: {
      type: Date,
      default: Date.now,
    },

    /*
    |--------------------------------------------------------------------------
    | SIGNATURE
    |--------------------------------------------------------------------------
    */

    guideSignature: {
      type: String,
      default: "",
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
tourReportSchema.virtual("imageCount").get(function () {
  // Return the length value to the caller.
  return this.images.length;
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.virtual("issueCount").get(function () {
  // Return the length value to the caller.
  return this.issues.length;
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  tour: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  booking: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  guide: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  driver: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  vehicle: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  completedAt: -1,
});

// Perform the side effect or state update expressed on the following line.
tourReportSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantTourReportSchema for use by the surrounding module or function.
const tenantTourReportSchema = tourReportSchema.plugin(tenantPlugin);
// Declare TourReport for use by the surrounding module or function.
const TourReport = mongoose.models.TourReport || mongoose.model("TourReport", tenantTourReportSchema);








export default TourReport;
