// server/models/TourGallery.js

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
      maxlength: 200,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: firestore.Schema.Types.ObjectId,
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

const tourGallerySchema = new firestore.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | RELATED TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: firestore.Schema.Types.ObjectId,
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
      type: firestore.Schema.Types.ObjectId,
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

tourGallerySchema.virtual("imageCount").get(function () {
  return this.images.length;
});

tourGallerySchema.virtual("featuredImage").get(function () {
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

tourGallerySchema.methods.addImage = function (image) {
  this.images.push(image);
  return this.save();
};

tourGallerySchema.methods.removeImage = function (imageId) {
  this.images = this.images.filter(
    (image) => image._id.toString() !== imageId.toString()
  );

  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

tourGallerySchema.index({
  active: 1,
});

tourGallerySchema.index({
  isDeleted: 1,
});

tourGallerySchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantTourGallerySchema = tourGallerySchema.plugin(tenantPlugin);
const TourGallery = firestore.models.TourGallery || firestore.model("TourGallery", tenantTourGallerySchema);








export default TourGallery;
