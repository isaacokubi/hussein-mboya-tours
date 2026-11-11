/**
 * Purpose: Wishlist database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Wishlist.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| WISHLIST SCHEMA
|--------------------------------------------------------------------------
|
| Each user owns one wishlist.
| A wishlist contains multiple tours.
|
|--------------------------------------------------------------------------
*/

// Declare wishlistSchema for use by the surrounding module or function.
const wishlistSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    /*
    |--------------------------------------------------------------------------
    | OWNER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,

    },

    /*
    |--------------------------------------------------------------------------
    | SAVED TOURS
    |--------------------------------------------------------------------------
    */

    tours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],
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
wishlistSchema.virtual("totalTours").get(function () {
  // Return the length value to the caller.
  return this.tours.length;
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
wishlistSchema.methods.hasTour = function (tourId) {
  // Return the result of this.tours.some() to the caller.
  return this.tours.some(
    (id) => id.toString() === tourId.toString()
  );
};

// Perform the side effect or state update expressed on the following line.
wishlistSchema.methods.addTour = function (tourId) {
  // Check the condition (!this.hasTour(tourId)) and run the matching branch.
  if (!this.hasTour(tourId)) {
    // Perform the side effect or state update expressed on the following line.
    this.tours.push(tourId);
  }

  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
wishlistSchema.methods.removeTour = function (tourId) {
  // Perform the side effect or state update expressed on the following line.
  this.tours = this.tours.filter(
    (id) => id.toString() !== tourId.toString()
  );

  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
wishlistSchema.methods.clearWishlist = function () {
  // Perform the side effect or state update expressed on the following line.
  this.tours = [];
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| PRE-SAVE
|--------------------------------------------------------------------------
|
| Remove duplicate tour IDs.
|
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
wishlistSchema.pre("save", function (next) {
  // Perform the side effect or state update expressed on the following line.
  this.tours = [
    ...new Map(
      this.tours.map((id) => [id.toString(), id])
    ).values(),
  ];

  // Perform the side effect or state update expressed on the following line.
  next();
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Fast lookup by user


// Lookup by saved tour
// Perform the side effect or state update expressed on the following line.
wishlistSchema.index({
  tours: 1,
});

// Recently updated wishlists
// Perform the side effect or state update expressed on the following line.
wishlistSchema.index({
  updatedAt: -1,
});

/*
|--------------------------------------------------------------------------
| MODEL EXPORT
|--------------------------------------------------------------------------
*/

// Declare tenantWishlistSchema for use by the surrounding module or function.
const tenantWishlistSchema = wishlistSchema.plugin(tenantPlugin);
// Declare Wishlist for use by the surrounding module or function.
const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", tenantWishlistSchema);








export default Wishlist;
