// server/models/Notification.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| NOTIFICATION SCHEMA
|--------------------------------------------------------------------------
|
| Stores notifications for users including:
| - Booking updates
| - Payments
| - Tour assignments
| - Promotions
| - System alerts
|
|--------------------------------------------------------------------------
*/

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    /*
    |--------------------------------------------------------------------------
    | RECIPIENT
    |--------------------------------------------------------------------------
    */

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | BACKWARD COMPATIBILITY
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TITLE
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
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
        "promotion",
        "system",
        "alert",
      ],
      default: "system",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PRIORITY
    |--------------------------------------------------------------------------
    */

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    /*
    |--------------------------------------------------------------------------
    | READ STATUS
    |--------------------------------------------------------------------------
    */

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ACTION URL
    |--------------------------------------------------------------------------
    */

    actionUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RELATED DOCUMENT
    |--------------------------------------------------------------------------
    */

    relatedModel: {
      type: String,
      enum: [
        "Booking",
        "CustomTourRequest",
        "Tour",
        "Payment",
        "Vehicle",
        "Staff",
        "User",
        "Notification",
      ],
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | METADATA
    |--------------------------------------------------------------------------
    */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
    |--------------------------------------------------------------------------
    | DELIVERY STATUS
    |--------------------------------------------------------------------------
    */

    isSent: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  read: 1,
});

notificationSchema.index({
  recipient: 1,
  type: 1,
});

notificationSchema.index({
  createdAt: -1,
});

notificationSchema.index({
  isArchived: 1,
});

/*
|--------------------------------------------------------------------------
| VIRTUAL RECEIVER
|--------------------------------------------------------------------------
*/

notificationSchema.virtual("receiver").get(function () {
  return this.recipient || this.user;
});

/*
|--------------------------------------------------------------------------
| AUTO SYNC LEGACY USER FIELD
|--------------------------------------------------------------------------
*/

notificationSchema.pre("save", function (next) {
  if (!this.user && this.recipient) {
    this.user = this.recipient;
  }

  if (this.read && !this.readAt) {
    this.readAt = new Date();
  }

  next();
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

notificationSchema.methods.markAsRead = async function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.archive = async function () {
  this.isArchived = true;
  return this.save();
};

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipient: userId,
    read: false,
    isArchived: false,
  });
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    {
      recipient: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;