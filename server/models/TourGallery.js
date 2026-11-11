/**
 * Purpose: Tour Gallery database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/TourGallery.js

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
      maxlength: 200,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| TOUR GALLERY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare tourGallerySchema for use by the surrounding module or function.
const tourGallerySchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | RELATED TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | GALLERY IMAGES
    |--------------------------------------------------------------------------
    */

    images: [imageSchema],

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    active: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
tourGallerySchema.virtual("imageCount").get(function () {
  // Return the length value to the caller.
  return this.images.length;
});

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.virtual("featuredImage").get(function () {
  // Return the expression shown below to the caller.
  return (
    this.images.find((image) => image.featured) ||
    this.images[0] ||
    null
  );
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.methods.addImage = function (image) {
  // Perform the side effect or state update expressed on the following line.
  this.images.push(image);
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.methods.removeImage = function (imageId) {
  // Perform the side effect or state update expressed on the following line.
  this.images = this.images.filter(
    (image) => image._id.toString() !== imageId.toString()
  );

  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.index({
  active: 1,
});

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.index({
  isDeleted: 1,
});

// Perform the side effect or state update expressed on the following line.
tourGallerySchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantTourGallerySchema for use by the surrounding module or function.
const tenantTourGallerySchema = tourGallerySchema.plugin(tenantPlugin);
// Declare TourGallery for use by the surrounding module or function.
const TourGallery = mongoose.models.TourGallery || mongoose.model("TourGallery", tenantTourGallerySchema);








export default TourGallery;
