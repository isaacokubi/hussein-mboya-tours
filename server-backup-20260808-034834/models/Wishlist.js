// server/models/Wishlist.js

import mongoose from "mongoose";

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

const wishlistSchema = new mongoose.Schema(
  {
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

wishlistSchema.virtual("totalTours").get(function () {
  return this.tours.length;
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

wishlistSchema.methods.hasTour = function (tourId) {
  return this.tours.some(
    (id) => id.toString() === tourId.toString()
  );
};

wishlistSchema.methods.addTour = function (tourId) {
  if (!this.hasTour(tourId)) {
    this.tours.push(tourId);
  }

  return this.save();
};

wishlistSchema.methods.removeTour = function (tourId) {
  this.tours = this.tours.filter(
    (id) => id.toString() !== tourId.toString()
  );

  return this.save();
};

wishlistSchema.methods.clearWishlist = function () {
  this.tours = [];
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

wishlistSchema.pre("save", function (next) {
  this.tours = [
    ...new Map(
      this.tours.map((id) => [id.toString(), id])
    ).values(),
  ];

  next();
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Fast lookup by user


// Lookup by saved tour
wishlistSchema.index({
  tours: 1,
});

// Recently updated wishlists
wishlistSchema.index({
  updatedAt: -1,
});

/*
|--------------------------------------------------------------------------
| MODEL EXPORT
|--------------------------------------------------------------------------
*/

const Wishlist =
  mongoose.models.Wishlist ||
  mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;