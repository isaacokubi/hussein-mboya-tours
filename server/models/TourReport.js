// server/models/TourReport.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

const imageSchema = new mongoose.Schema(
  {
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

const TourReport =
  mongoose.models.TourReport ||
  tourReportSchema.plugin(tenantPlugin);

mongoose.model("TourReport", tourReportSchema);

export default TourReport;