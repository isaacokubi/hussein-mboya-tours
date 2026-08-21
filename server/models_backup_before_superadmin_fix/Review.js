// server/models/Review.js

import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
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

reviewSchema.index({
  tour: 1,
  approved: 1,
});

reviewSchema.index({
  user: 1,
  createdAt: -1,
});

reviewSchema.index({
  rating: 1,
});

reviewSchema.index({
  verified: 1,
});

reviewSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

reviewSchema.virtual("helpfulnessScore").get(function () {
  return this.helpfulVotes - this.notHelpfulVotes;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

reviewSchema.methods.markApproved = function () {
  this.approved = true;
  this.rejected = false;
  this.rejectionReason = "";
  return this.save();
};

reviewSchema.methods.markRejected = function (reason = "") {
  this.approved = false;
  this.rejected = true;
  this.rejectionReason = reason;
  return this.save();
};

reviewSchema.methods.reply = function (userId, message) {
  this.adminReply = {
    message,
    repliedBy: userId,
    repliedAt: new Date(),
  };

  return this.save();
};

reviewSchema.methods.voteHelpful = function () {
  this.helpfulVotes += 1;
  return this.save();
};

reviewSchema.methods.voteNotHelpful = function () {
  this.notHelpfulVotes += 1;
  return this.save();
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Review =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);








reviewSchema.plugin(tenantIsolationPlugin);
export default Review;