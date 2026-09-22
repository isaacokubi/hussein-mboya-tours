// server/models/TourReport.js

import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

const imageSchema = new firestore.Schema(
  {

    tenantId:{
        type: firestore.Schema.Types.ObjectId,
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

const tourReportSchema = new firestore.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | TOUR INFORMATION
    |--------------------------------------------------------------------------
    */

    tour: {
      type: firestore.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    booking: {
      type: firestore.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

    guide: {
      type: firestore.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    driver: {
      type: firestore.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    vehicle: {
      type: firestore.Schema.Types.ObjectId,
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
      type: firestore.Schema.Types.ObjectId,
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

tourReportSchema.virtual("imageCount").get(function () {
  return this.images.length;
});

tourReportSchema.virtual("issueCount").get(function () {
  return this.issues.length;
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

tourReportSchema.index({
  tour: 1,
});

tourReportSchema.index({
  booking: 1,
});

tourReportSchema.index({
  guide: 1,
});

tourReportSchema.index({
  driver: 1,
});

tourReportSchema.index({
  vehicle: 1,
});

tourReportSchema.index({
  status: 1,
});

tourReportSchema.index({
  completedAt: -1,
});

tourReportSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantTourReportSchema = tourReportSchema.plugin(tenantPlugin);
const TourReport = firestore.models.TourReport || firestore.model("TourReport", tenantTourReportSchema);








export default TourReport;
