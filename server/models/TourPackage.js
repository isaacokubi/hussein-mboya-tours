// server/models/TourPackage.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
import slugify from "slugify";

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

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
| ITINERARY SCHEMA
|--------------------------------------------------------------------------
*/

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
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
| SEO SCHEMA
|--------------------------------------------------------------------------
*/

const seoSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    keywords: [String],
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| TOUR PACKAGE
|--------------------------------------------------------------------------
*/

const tourPackageSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      maxlength: 250,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DESTINATION
    |--------------------------------------------------------------------------
    */

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Kenya",
      trim: true,
    },

    startLocation: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    category: {
      type: String,
      enum: [
        "Safari",
        "Beach",
        "Adventure",
        "City Tour",
        "Mountain",
        "Culture",
        "Luxury",
        "Honeymoon",
      ],
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DURATION
    |--------------------------------------------------------------------------
    */

    duration: {
      type: String,
      required: true,
    },

    numberOfDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
    */

    coverImage: imageSchema,

    gallery: [imageSchema],

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    currency: {
      type: String,
      default: "KES",
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    agentPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountPrice: {
      type: Number,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CAPACITY
    |--------------------------------------------------------------------------
    */

    minimumGuests: {
      type: Number,
      default: 1,
    },

    maximumGuests: {
      type: Number,
      default: 10,
    },

    availableSeats: {
      type: Number,
      default: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | ITINERARY
    |--------------------------------------------------------------------------
    */

    itinerary: [itinerarySchema],

    /*
    |--------------------------------------------------------------------------
    | FEATURES
    |--------------------------------------------------------------------------
    */

    inclusions: [String],

    exclusions: [String],

    highlights: [String],

    /*
    |--------------------------------------------------------------------------
    | BOOKING
    |--------------------------------------------------------------------------
    */

    bookingDeadline: {
      type: Number,
      default: 1,
    },

    instantBooking: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RATINGS
    |--------------------------------------------------------------------------
    */

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "inactive",
        "sold_out",
      ],
      default: "draft",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | OWNERSHIP
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    seo: seoSchema,

    /*
    |--------------------------------------------------------------------------
    | ANALYTICS
    |--------------------------------------------------------------------------
    */

    views: {
      type: Number,
      default: 0,
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
| AUTO SLUG
|--------------------------------------------------------------------------
*/

tourPackageSchema.pre("validate", function (next) {
  if (
    this.title &&
    (!this.slug || this.isModified("title"))
  ) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

tourPackageSchema.virtual("customerPrice").get(function () {
  if (this.discountPrice) return this.discountPrice;

  if (this.discountPercentage > 0) {
    return (
      this.basePrice -
      (this.basePrice * this.discountPercentage) / 100
    );
  }

  return this.basePrice;
});

tourPackageSchema.virtual("isAvailable").get(function () {
  return (
    this.availableSeats > 0 &&
    this.status === "active"
  );
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

tourPackageSchema.methods.bookSeats = function (count = 1) {
  this.availableSeats = Math.max(
    0,
    this.availableSeats - count
  );

  if (this.availableSeats === 0) {
    this.status = "sold_out";
  }

  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



tourPackageSchema.index({
  destination: 1,
});

tourPackageSchema.index({
  category: 1,
});

tourPackageSchema.index({
  status: 1,
});

tourPackageSchema.index({
  featured: 1,
});

tourPackageSchema.index({
  published: 1,
});

tourPackageSchema.index({
  isDeleted: 1,
});

tourPackageSchema.index({
  basePrice: 1,
});

tourPackageSchema.index({
  averageRating: -1,
});

tourPackageSchema.index({
  totalBookings: -1,
});

tourPackageSchema.index({
  title: "text",
  description: "text",
  destination: "text",
  country: "text",
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const TourPackage =
  mongoose.models.TourPackage ||
  mongoose.model("TourPackage", tourPackageSchema);








export default TourPackage;