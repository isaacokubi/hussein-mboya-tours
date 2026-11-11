/**
 * Purpose: Tour Package database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/TourPackage.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Load slugify so this module can use its exported dependencies.
import slugify from "slugify";

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
| ITINERARY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare itinerarySchema for use by the surrounding module or function.
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

// Declare seoSchema for use by the surrounding module or function.
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

// Declare tourPackageSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.pre("validate", function (next) {
  // Check the condition (this.title && !this.slug) and run the matching branch.
  if (this.title && !this.slug) {
    // Perform the side effect or state update expressed on the following line.
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  // Perform the side effect or state update expressed on the following line.
  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.virtual("customerPrice").get(function () {
  // Check the condition (this.discountPrice) and run the matching branch.
  if (this.discountPrice) return this.discountPrice;

  // Check the condition (this.discountPercentage > 0) and run the matching branch.
  if (this.discountPercentage > 0) {
    // Return the expression shown below to the caller.
    return (
      this.basePrice -
      (this.basePrice * this.discountPercentage) / 100
    );
  }

  // Return the base Price value to the caller.
  return this.basePrice;
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.virtual("isAvailable").get(function () {
  // Return the expression shown below to the caller.
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

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.methods.bookSeats = function (count = 1) {
  // Perform the side effect or state update expressed on the following line.
  this.availableSeats = Math.max(
    0,
    this.availableSeats - count
  );

  // Check the condition (this.availableSeats === 0) and run the matching branch.
  if (this.availableSeats === 0) {
    // Perform the side effect or state update expressed on the following line.
    this.status = "sold_out";
  }

  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  destination: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  category: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  featured: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  published: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  isDeleted: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  basePrice: 1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  averageRating: -1,
});

// Perform the side effect or state update expressed on the following line.
tourPackageSchema.index({
  totalBookings: -1,
});

// Perform the side effect or state update expressed on the following line.
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

// Declare tenantTourPackageSchema for use by the surrounding module or function.
const tenantTourPackageSchema = tourPackageSchema.plugin(tenantPlugin);
// Declare TourPackage for use by the surrounding module or function.
const TourPackage = mongoose.models.TourPackage || mongoose.model("TourPackage", tenantTourPackageSchema);








export default TourPackage;
