// server/models/Media.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| MEDIA SCHEMA
|--------------------------------------------------------------------------
*/

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

mediaSchema.virtual("fileSizeMB").get(function () {
  return Number((this.size / (1024 * 1024)).toFixed(2));
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

mediaSchema.methods.incrementDownloads = function () {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

mediaSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

mediaSchema.index({
  category: 1,
});

mediaSchema.index({
  folder: 1,
});

mediaSchema.index({
  relatedModel: 1,
  relatedId: 1,
});

mediaSchema.index({
  visibility: 1,
});

mediaSchema.index({
  isDeleted: 1,
});

mediaSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantMediaSchema = mediaSchema.plugin(tenantPlugin);
const Media = mongoose.models.Media || mongoose.model("Media", tenantMediaSchema);








export default Media;