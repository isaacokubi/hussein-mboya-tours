// server/models/Notification.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      immutable: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

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

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    actionUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

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

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    isSent: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ tenantId: 1, recipient: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, recipient: 1, read: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, recipient: 1, type: 1, createdAt: -1 });

notificationSchema.virtual("receiver").get(function () {
  return this.recipient || this.user;
});

notificationSchema.pre("save", function (next) {
  if (!this.user && this.recipient) this.user = this.recipient;
  if (this.read && !this.readAt) this.readAt = new Date();
  next();
});

notificationSchema.methods.markAsRead = async function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.archive = async function () {
  this.isArchived = true;
  return this.save();
};

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

const tenantNotificationSchema = notificationSchema.plugin(tenantPlugin);
const Notification = mongoose.models.Notification || mongoose.model("Notification", tenantNotificationSchema);

export default Notification;
