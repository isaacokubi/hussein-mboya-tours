// models/Notification.js

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER RECEIVING NOTIFICATION
    |--------------------------------------------------------------------------
    */

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Backward compatibility for older controllers
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION TITLE
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true
    },

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION MESSAGE
    |--------------------------------------------------------------------------
    */

    message: {
      type: String,
      required: true,
      trim: true
    },

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION CATEGORY
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: [
        "booking",
        "payment",
        "tour_assignment",
        "tour_update",
        "assignment",
        "system",
        "promotion",
        "alert"
      ],
      default: "system"
    },

    /*
    |--------------------------------------------------------------------------
    | READ STATUS
    |--------------------------------------------------------------------------
    */

    read: {
      type: Boolean,
      default: false
    },

    /*
    |--------------------------------------------------------------------------
    | EXTRA METADATA
    |--------------------------------------------------------------------------
    */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// ============================================================
// INDEXES
// ============================================================

notificationSchema.index({
  recipient: 1,
  read: 1
});

notificationSchema.index({
  user: 1,
  read: 1
});

notificationSchema.index({
  createdAt: -1
});

// ============================================================
// VIRTUAL RECEIVER
// ============================================================

notificationSchema.virtual("receiver").get(function () {
  return this.recipient || this.user;
});

// ============================================================
// MODEL
// ============================================================

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;