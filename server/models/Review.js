/**
 * Purpose: Review database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Review.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| REVIEW SCHEMA
|--------------------------------------------------------------------------
|
| Customer reviews for completed tours.
|
| One completed booking can have one review.
|
|--------------------------------------------------------------------------
*/

// Declare reviewSchema for use by the surrounding module or function.
const reviewSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    /*
    |--------------------------------------------------------------------------
    | REVIEW AUTHOR
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Legacy compatibility
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RELATED BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RATING
    |--------------------------------------------------------------------------
    */

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    /*
    |--------------------------------------------------------------------------
    | REVIEW CONTENT
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
    */

    images: [
      {
        type: String,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    recommend: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | VERIFIED REVIEW
    |--------------------------------------------------------------------------
    */

    verified: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | MODERATION
    |--------------------------------------------------------------------------
    */

    approved: {
      type: Boolean,
      default: false,
      index: true,
    },

    rejected: {
      type: Boolean,
      default: false,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN RESPONSE
    |--------------------------------------------------------------------------
    */

    adminReply: {
      message: {
        type: String,
        default: "",
      },

      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      repliedAt: {
        type: Date,
        default: null,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | COMMUNITY FEEDBACK
    |--------------------------------------------------------------------------
    */

    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    notHelpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
reviewSchema.index({
  tour: 1,
  approved: 1,
});

// Perform the side effect or state update expressed on the following line.
reviewSchema.index({
  user: 1,
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
reviewSchema.index({
  rating: 1,
});

// Perform the side effect or state update expressed on the following line.
reviewSchema.index({
  verified: 1,
});

// Perform the side effect or state update expressed on the following line.
reviewSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
reviewSchema.virtual("helpfulnessScore").get(function () {
  // Return the expression shown below to the caller.
  return this.helpfulVotes - this.notHelpfulVotes;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
reviewSchema.methods.markApproved = function () {
  // Perform the side effect or state update expressed on the following line.
  this.approved = true;
  // Perform the side effect or state update expressed on the following line.
  this.rejected = false;
  // Perform the side effect or state update expressed on the following line.
  this.rejectionReason = "";
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
reviewSchema.methods.markRejected = function (reason = "") {
  // Perform the side effect or state update expressed on the following line.
  this.approved = false;
  // Perform the side effect or state update expressed on the following line.
  this.rejected = true;
  // Perform the side effect or state update expressed on the following line.
  this.rejectionReason = reason;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
reviewSchema.methods.reply = function (userId, message) {
  // Perform the side effect or state update expressed on the following line.
  this.adminReply = {
    message,
    repliedBy: userId,
    repliedAt: new Date(),
  };

  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
reviewSchema.methods.voteHelpful = function () {
  // Perform the side effect or state update expressed on the following line.
  this.helpfulVotes += 1;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
reviewSchema.methods.voteNotHelpful = function () {
  // Perform the side effect or state update expressed on the following line.
  this.notHelpfulVotes += 1;
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantReviewSchema for use by the surrounding module or function.
const tenantReviewSchema = reviewSchema.plugin(tenantPlugin);
// Declare Review for use by the surrounding module or function.
const Review = mongoose.models.Review || mongoose.model("Review", tenantReviewSchema);








export default Review;
