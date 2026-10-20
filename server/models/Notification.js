// Import Mongoose to define notification records and validation rules.
import mongoose from "mongoose";
// Apply tenant-scoped read/write protections to notifications.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Import aggregation filtering for tenant-aware notification reporting.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Define the notification record shared by in-app alerts and operational events.
const notificationSchema = new mongoose.Schema(
  {
    // Tenant that owns the notification; immutable after creation.
    tenantId: {
      type: mongoose.Schema.Types.ObjectId, // Store the tenant identifier.
      ref: "Organization", // Link to the owning organization.
      index: true, // Speed up tenant-scoped notification queries.
      immutable: true, // Prevent moving a notification into another tenant.
    },

    // User who should receive the notification.
    recipient: {
      type: mongoose.Schema.Types.ObjectId, // Store the recipient user identifier.
      ref: "User", // Link to the user account.
      required: true, // Every notification must have a recipient.
      index: true, // Speed up recipient inbox lookups.
    },

    // Legacy/alternate recipient reference retained for compatibility.
    user: {
      type: mongoose.Schema.Types.ObjectId, // Store the related user identifier.
      ref: "User", // Link to the user account.
      default: null, // Populate from recipient before saving when missing.
    },

    // Short heading shown in the notification list.
    title: {
      type: String, // Store the heading as text.
      required: true, // Every notification must have a title.
      trim: true, // Remove surrounding whitespace.
      maxlength: 150, // Keep headings short for UI display.
    },

    // Main notification message shown to the recipient.
    message: {
      type: String, // Store the notification body.
      required: true, // Every notification must include a message.
      trim: true, // Remove surrounding whitespace.
      maxlength: 2000, // Bound message length.
    },

    // Classify the event so the UI can choose an icon/filter.
    type: {
      type: String, // Store the event category.
      enum: [
        "booking", // Booking created/changed.
        "payment", // Payment received or changed.
        "tour_assignment", // Tour assignment event.
        "tour_update", // Tour progress/status event.
        "assignment", // General staff/resource assignment event.
        "promotion", // Promotional message.
        "system", // General system notification.
        "alert", // Important alert requiring attention.
      ],
      default: "system", // Use a general category when none is supplied.
      index: true, // Speed up filtering by notification type.
    },

    // Urgency level used to prioritize presentation.
    priority: {
      type: String, // Store the priority label.
      enum: ["low", "normal", "high", "urgent"], // Accept only supported priority values.
      default: "normal", // Use normal priority unless specified.
    },

    // Whether the recipient has read the notification.
    read: {
      type: Boolean, // Store the read/unread flag.
      default: false, // New notifications start unread.
      index: true, // Speed up unread-notification queries.
    },

    // Time the notification was marked read.
    readAt: {
      type: Date, // Store the read timestamp.
      default: null, // No timestamp exists until the notification is read.
    },

    // Optional route the frontend can open when the notification is clicked.
    actionUrl: {
      type: String, // Store the navigation URL as text.
      default: "", // No action is attached by default.
      trim: true, // Remove surrounding whitespace.
      maxlength: 500, // Bound the stored URL length.
    },

    // Optional model type for the record associated with this notification.
    relatedModel: {
      type: String, // Store the associated model name.
      enum: [
        "Booking", // Notification refers to a booking.
        "CustomTourRequest", // Notification refers to a custom tour request.
        "Tour", // Notification refers to a tour.
        "Payment", // Notification refers to a payment.
        "Vehicle", // Notification refers to a vehicle.
        "Staff", // Notification refers to staff.
        "User", // Notification refers to a user.
        "Notification", // Notification refers to another notification record.
      ],
      default: null, // Allow notifications without a linked model.
    },

    // Identifier of the related record, when the notification references one.
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Store the related document identifier.
      default: null, // No related record is required for every notification.
    },

    // Flexible event metadata used by specialized notification views.
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Allow event-specific JSON-like data.
      default: () => ({}), // Give each document its own empty metadata object.
    },

    // Whether the notification has been delivered/sent by the creating workflow.
    isSent: {
      type: Boolean, // Store delivery state.
      default: true, // Existing workflows create notifications as sent by default.
    },

    // Whether the notification is hidden from the active inbox.
    isArchived: {
      type: Boolean, // Store archive state.
      default: false, // New notifications appear in the active inbox.
      index: true, // Speed up active/archive filters.
    },
  },
  {
    timestamps: true, // Automatically record creation and update times.
  }
);

// Index recipient inboxes newest-first within each tenant.
notificationSchema.index({ tenantId: 1, recipient: 1, createdAt: -1 });
// Index unread/archived filters used by inbox screens.
notificationSchema.index({ tenantId: 1, recipient: 1, read: 1, isArchived: 1, createdAt: -1 });
// Index notification history filtered by type.
notificationSchema.index({ tenantId: 1, recipient: 1, type: 1, createdAt: -1 });

// Provide a compatibility property that returns the primary or legacy recipient reference.
notificationSchema.virtual("receiver").get(function () {
  return this.recipient || this.user;
});

// Synchronize legacy recipient and read timestamp fields before persisting.
notificationSchema.pre("save", function (next) {
  // Populate the legacy user field when only recipient is supplied.
  if (!this.user && this.recipient) this.user = this.recipient;
  // Add a read timestamp when the read flag is enabled but no timestamp exists.
  if (this.read && !this.readAt) this.readAt = new Date();
  // Continue the save operation.
  next();
});

// Mark this notification read and persist the read timestamp.
notificationSchema.methods.markAsRead = async function () {
  // Set the read flag.
  this.read = true;
  // Record when it was marked read.
  this.readAt = new Date();
  // Persist the updated notification.
  return this.save();
};

// Archive this notification so it can be hidden from the active inbox.
notificationSchema.methods.archive = async function () {
  // Set the archive flag.
  this.isArchived = true;
  // Persist the change.
  return this.save();
};

// Count unread, non-archived notifications for a user.
notificationSchema.statics.getUnreadCount = function (userId) {
  // Count only notifications for this recipient that are unread and active.
  return this.countDocuments({
    recipient: userId, // Restrict the count to the requested recipient.
    read: false, // Exclude notifications already read.
    isArchived: false, // Exclude notifications hidden in the archive.
  });
};

// Mark all unread notifications for a user as read in one database update.
notificationSchema.statics.markAllAsRead = function (userId) {
  // Match this user's currently unread notifications.
  return this.updateMany(
    {
      recipient: userId, // Restrict updates to the selected recipient.
      read: false, // Do not rewrite already-read notifications.
    },
    {
      $set: {
        read: true, // Mark matching notifications as read.
        readAt: new Date(), // Use the current time as their read timestamp.
      },
    }
  );
};

// Attach tenant protections before model registration.
const tenantNotificationSchema = notificationSchema.plugin(tenantPlugin);
// Reuse an existing model during reloads or register the Notification model.
const Notification = mongoose.models.Notification || mongoose.model("Notification", tenantNotificationSchema);

// Export the model used by notification services and API handlers.
export default Notification;
