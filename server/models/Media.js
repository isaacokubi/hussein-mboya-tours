/**
 * Purpose: Media database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Media.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| MEDIA SCHEMA
|--------------------------------------------------------------------------
*/

// Declare mediaSchema for use by the surrounding module or function.
const mediaSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | FILE INFORMATION
    |--------------------------------------------------------------------------
    */

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | FILE DETAILS
    |--------------------------------------------------------------------------
    */

    fileType: {
      type: String,
      enum: [
        "image",
        "video",
        "document",
        "pdf",
        "audio",
        "other",
      ],
      required: true,
    },

    mimeType: {
      type: String,
      default: "",
    },

    extension: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | IMAGE / VIDEO METADATA
    |--------------------------------------------------------------------------
    */

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    duration: {
      type: Number,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION
    |--------------------------------------------------------------------------
    */

    folder: {
      type: String,
      default: "general",
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "tour",
        "destination",
        "vehicle",
        "staff",
        "customer",
        "booking",
        "marketing",
        "document",
        "other",
      ],
      default: "other",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | RELATED RECORD
    |--------------------------------------------------------------------------
    */

    relatedModel: {
      type: String,
      enum: [
        "Tour",
        "Destination",
        "Vehicle",
        "Staff",
        "Booking",
        "Customer",
        "User",
      ],
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | OWNERSHIP
    |--------------------------------------------------------------------------
    */

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    visibility: {
      type: String,
      enum: [
        "public",
        "private",
        "internal",
      ],
      default: "public",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | DOWNLOADS
    |--------------------------------------------------------------------------
    */

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastDownloadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
mediaSchema.virtual("fileSizeMB").get(function () {
  // Return the result of Number() to the caller.
  return Number((this.size / (1024 * 1024)).toFixed(2));
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
mediaSchema.methods.incrementDownloads = function () {
  // Perform the side effect or state update expressed on the following line.
  this.downloadCount += 1;
  // Perform the side effect or state update expressed on the following line.
  this.lastDownloadedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  category: 1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  folder: 1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  relatedModel: 1,
  relatedId: 1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  visibility: 1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  isDeleted: 1,
});

// Perform the side effect or state update expressed on the following line.
mediaSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantMediaSchema for use by the surrounding module or function.
const tenantMediaSchema = mediaSchema.plugin(tenantPlugin);
// Declare Media for use by the surrounding module or function.
const Media = mongoose.models.Media || mongoose.model("Media", tenantMediaSchema);








export default Media;
