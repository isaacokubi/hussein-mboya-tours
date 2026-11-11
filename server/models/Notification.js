/**
 * Purpose: Notification database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Notification.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Declare notificationSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
notificationSchema.index({ tenantId: 1, recipient: 1, createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
notificationSchema.index({ tenantId: 1, recipient: 1, read: 1, isArchived: 1, createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
notificationSchema.index({ tenantId: 1, recipient: 1, type: 1, createdAt: -1 });

// Perform the side effect or state update expressed on the following line.
notificationSchema.virtual("receiver").get(function () {
  // Return the expression shown below to the caller.
  return this.recipient || this.user;
});

// Perform the side effect or state update expressed on the following line.
notificationSchema.pre("save", function (next) {
  // Check the condition (!this.user && this.recipient) and run the matching branch.
  if (!this.user && this.recipient) this.user = this.recipient;
  // Check the condition (this.read && !this.readAt) and run the matching branch.
  if (this.read && !this.readAt) this.readAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
notificationSchema.methods.markAsRead = async function () {
  // Perform the side effect or state update expressed on the following line.
  this.read = true;
  // Perform the side effect or state update expressed on the following line.
  this.readAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
notificationSchema.methods.archive = async function () {
  // Perform the side effect or state update expressed on the following line.
  this.isArchived = true;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
notificationSchema.statics.getUnreadCount = function (userId) {
  // Return the result of this.countDocuments() to the caller.
  return this.countDocuments({
    recipient: userId,
    read: false,
    isArchived: false,
  });
};

// Perform the side effect or state update expressed on the following line.
notificationSchema.statics.markAllAsRead = function (userId) {
  // Return the result of this.updateMany() to the caller.
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

// Declare tenantNotificationSchema for use by the surrounding module or function.
const tenantNotificationSchema = notificationSchema.plugin(tenantPlugin);
// Declare Notification for use by the surrounding module or function.
const Notification = mongoose.models.Notification || mongoose.model("Notification", tenantNotificationSchema);

export default Notification;
