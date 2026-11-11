/**
 * Purpose: notification Controller HTTP controller. Main declarations: isValidId, escapeHtml, getBookingContact, getNotificationType, normalizeRole.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";

// Load ../services/smsService.js so this module can use its exported dependencies.
import {
  sendSMS,
} from "../services/smsService.js";

// Load ../services/whatsappService.js so this module can use its exported dependencies.
import {
  sendWhatsApp,
} from "../services/whatsappService.js";

// Load ../services/emailService.js so this module can use its exported dependencies.
import {
  sendEmail,
} from "../services/emailService.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);
// Declare escapeHtml for use by the surrounding module or function.
const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));

// Declare getBookingContact for use by the surrounding module or function.
const getBookingContact = (booking) => ({
  name:
    booking.customerSnapshot?.name ||
    booking.contact?.name ||
    "",

  email:
    booking.customerSnapshot?.email ||
    booking.contact?.email ||
    "",

  phone:
    booking.customerSnapshot?.phone ||
    booking.contact?.phone ||
    "",
});

// Declare getNotificationType for use by the surrounding module or function.
const getNotificationType = (type) => {
  // Check the condition (type === "confirmation" || type === "booking") and run the matching branch.
  if (
    type === "confirmation" ||
    type === "booking"
  ) {
    // Return a configured text value to the caller.
    return "booking";
  }

  // Check the condition (type === "payment" || type === "payment_reminder") and run the matching branch.
  if (
    type === "payment" ||
    type === "payment_reminder"
  ) {
    // Return a configured text value to the caller.
    return "payment";
  }

  // Check the condition (type === "tour_update" || type === "trip_reminder") and run the matching branch.
  if (
    type === "tour_update" ||
    type === "trip_reminder"
  ) {
    // Return a configured text value to the caller.
    return "tour_update";
  }

  // Return a configured text value to the caller.
  return "alert";
};



// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value) =>
  String(
    typeof value === "object"
      ? value?.name || value?.role || ""
      : value || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

// Declare requesterCanSendStaffNotifications for use by the surrounding module or function.
const requesterCanSendStaffNotifications = (user) =>
  ["admin", "super_admin", "administrator", "tourmanager", "manager"].includes(
    normalizeRole(user?.roleId?.name || user?.role || user?.legacyRole)
  );

/*
|--------------------------------------------------------------------------
| STAFF / INTERNAL NOTIFICATION RECIPIENTS
|--------------------------------------------------------------------------
*/

// Declare getNotificationRecipients for use by the surrounding module or function.
export const getNotificationRecipients = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!requesterCanSendStaffNotifications(req.user)) and run the matching branch.
    if (!requesterCanSendStaffNotifications(req.user)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });
    }

    // Declare requested for use by the surrounding module or function.
    const requested = String(req.query.roles || "guide,driver,agent,admin,manager")
      .split(",")
      .map((v) => normalizeRole(v))
      .filter(Boolean);

    // Declare roleMap for use by the surrounding module or function.
    const roleMap = {
      guide: ["guide", "tourguide"],
      tourguide: ["guide", "tourguide"],
      driver: ["driver"],
      agent: ["agent", "travelagent"],
      admin: ["admin", "super_admin", "administrator"],
      manager: ["manager", "tourmanager", "tour_manager"],
      tourmanager: ["manager", "tourmanager", "tour_manager"],
    };

    // Declare allowedRoles for use by the surrounding module or function.
    const allowedRoles = [...new Set(requested.flatMap((r) => roleMap[r] || []))];
    // Declare roleDocs for use by the surrounding module or function.
    const roleDocs = await Role.find(
      mergeTenantFilter({
        name: { $in: allowedRoles },
      })
    ).select("_id").lean();
    // Declare roleIds for use by the surrounding module or function.
    const roleIds = roleDocs.map((role) => role._id);

    // Declare users for use by the surrounding module or function.
    const users = await User.find(
      mergeTenantFilter({
        $or: [
          { role: { $in: allowedRoles } },
          { legacyRole: { $in: allowedRoles } },
          ...(roleIds.length ? [{ roleId: { $in: roleIds } }] : []),
        ],
        status: "active",
        isActive: { $ne: false },
      })
    )
      .select("_id name firstName lastName email phone role legacyRole roleId")
      .populate("roleId", "name displayName")
      .sort({ name: 1, email: 1 })
      .lean();

    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.find(
      mergeTenantFilter({
        position: {
          $in: requested.flatMap((r) => ({
          guide: ["guide"],
          tourguide: ["guide"],
          driver: ["driver"],
          agent: [],
          admin: ["admin"],
          manager: ["tour_manager"],
          tourmanager: ["tour_manager"],
        }[r] || [])),
        },
        status: "active",
        isDeleted: { $ne: true },
      })
    ).select("user name email phone position").lean();

    // Declare linkedIds for use by the surrounding module or function.
    const linkedIds = new Set(users.map((u) => u._id.toString()));
    // Declare extra for use by the surrounding module or function.
    const extra = [];

    // Repeat the enclosed work for each required iteration.
    for (const member of staff) {
      // Check the condition (member.user && !linkedIds.has(member.user.toString())) and run the matching branch.
      if (member.user && !linkedIds.has(member.user.toString())) {
        // Declare user for use by the surrounding module or function.
        const user = await User.findOne(
          mergeTenantFilter({
            _id: member.user,
          })
        )
          .select("_id name firstName lastName email phone role legacyRole roleId")
          .populate("roleId", "name displayName")
          .lean();
        // Check the condition (user && user.status === "active" && user.isActive !== false) and run the matching branch.
        if (user && user.status === "active" && user.isActive !== false) {
          // Perform the side effect or state update expressed on the following line.
          extra.push(user);
          // Perform the side effect or state update expressed on the following line.
          linkedIds.add(user._id.toString());
        }
      }
    }

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      recipients: [...users, ...extra],
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare sendInternalNotification for use by the surrounding module or function.
export const sendInternalNotification = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!requesterCanSendStaffNotifications(req.user)) and run the matching branch.
    if (!requesterCanSendStaffNotifications(req.user)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });
    }

    // Declare { recipientIds = [], roles = [], title, message, type = "system", priority = "normal", actionUrl = "", } for use by the surrounding module or function.
    const {
      recipientIds = [],
      roles = [],
      title,
      message,
      type = "system",
      priority = "normal",
      actionUrl = "",
    } = req.body || {};

    // Check the condition (!title?.trim() || !message?.trim()) and run the matching branch.
    if (!title?.trim() || !message?.trim()) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    // Declare normalizedIds for use by the surrounding module or function.
    const normalizedIds = Array.isArray(recipientIds)
      ? recipientIds.filter((id) => isValidId(id))
      : [];

    // Declare normalizedRoles for use by the surrounding module or function.
    const normalizedRoles = Array.isArray(roles)
      ? roles.map(normalizeRole).filter(Boolean)
      : [];

    // Declare roleMap for use by the surrounding module or function.
    const roleMap = {
      guide: ["guide", "tourguide"],
      tourguide: ["guide", "tourguide"],
      driver: ["driver"],
      agent: ["agent", "travelagent"],
      admin: ["admin", "super_admin", "administrator"],
      manager: ["manager", "tourmanager", "tour_manager"],
      tourmanager: ["manager", "tourmanager", "tour_manager"],
    };

    // Declare expandedRoles for use by the surrounding module or function.
    const expandedRoles = [...new Set(normalizedRoles.flatMap((r) => roleMap[r] || []))];

    // Declare filter for use by the surrounding module or function.
    const filter = [];
    // Check the condition (normalizedIds.length) and run the matching branch.
    if (normalizedIds.length) filter.push({ _id: { $in: normalizedIds } });
    // Check the condition (expandedRoles.length) and run the matching branch.
    if (expandedRoles.length) {
      // Perform the side effect or state update expressed on the following line.
      filter.push(
        { role: { $in: expandedRoles } },
        { legacyRole: { $in: expandedRoles } }
      );
    }

    // Check the condition (!filter.length) and run the matching branch.
    if (!filter.length) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Select at least one recipient or recipient group." });
    }

    // Declare roleDocs for use by the surrounding module or function.
    const roleDocs = expandedRoles.length
      ? await Role.find(
          mergeTenantFilter({
            name: { $in: expandedRoles },
          })
        ).select("_id").lean()
      : [];
    // Declare roleIds for use by the surrounding module or function.
    const roleIds = roleDocs.map((role) => role._id);
    // Check the condition (roleIds.length) and run the matching branch.
    if (roleIds.length) filter.push({ roleId: { $in: roleIds } });

    // Declare recipients for use by the surrounding module or function.
    const recipients = await User.find(
      mergeTenantFilter({
        $or: filter,
        status: "active",
        isActive: { $ne: false },
      })
    ).select("_id");

    // Check the condition (!recipients.length) and run the matching branch.
    if (!recipients.length) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({ success: false, message: "No active recipients matched your selection." });
    }

    // Declare docs for use by the surrounding module or function.
    const docs = recipients.map((user) => ({
      recipient: user._id,
      user: user._id,
      title: title.trim(),
      message: message.trim(),
      type: ["booking", "payment", "tour_assignment", "tour_update", "assignment", "promotion", "system", "alert"].includes(type) ? type : "system",
      priority: ["low", "normal", "high", "urgent"].includes(priority) ? priority : "normal",
      actionUrl: actionUrl.trim(),
      metadata: { sentBy: req.user._id, internal: true },
      isSent: true,
      isArchived: false,
      read: false,
    }));

    // Declare created for use by the surrounding module or function.
    const created = await Notification.insertMany(docs);

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      message: `Notification sent to ${created.length} recipient${created.length === 1 ? "" : "s"}.`,
      count: created.length,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
*/

// Declare getNotifications for use by the surrounding module or function.
export const getNotifications = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    // Declare filter for use by the surrounding module or function.
    const filter = {
      recipient: req.user._id,
      isArchived: false,
    };

    // Check the condition (req.query.unread === "true") and run the matching branch.
    if (
      req.query.unread === "true"
    ) {
      // Perform the side effect or state update expressed on the following line.
      filter.read = false;
    }

    // Check the condition (req.query.type) and run the matching branch.
    if (req.query.type) {
      // Perform the side effect or state update expressed on the following line.
      filter.type =
        req.query.type;
    }

    // Declare skip for use by the surrounding module or function.
    const skip =
      (page - 1) * limit;

    // Declare [ notifications, total, ] for use by the surrounding module or function.
    const [
      notifications,
      total,
    ] = await Promise.all([
      Notification.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(
        filter
      ),
    ]);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(
        total / limit
      ),
      count:
        notifications.length,
      notifications,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MY NOTIFICATIONS
|--------------------------------------------------------------------------
*/

// Declare getMyNotifications for use by the surrounding module or function.
export const getMyNotifications =
  getNotifications;

/*
|--------------------------------------------------------------------------
| MARK READ
|--------------------------------------------------------------------------
*/

// Declare markRead for use by the surrounding module or function.
export const markRead = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (
      !isValidId(req.params.id)
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification ID.",
      });
    }

    // Declare notification for use by the surrounding module or function.
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
        isArchived: false,
      });

    // Check the condition (!notification) and run the matching branch.
    if (!notification) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message:
          "Notification not found.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    await notification.markAsRead();

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read.",
      notification,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| SEND BOOKING NOTIFICATION
|--------------------------------------------------------------------------
*/

// Declare sendBookingNotification for use by the surrounding module or function.
export const sendBookingNotification =
  async (
    req,
    res,
    next
  ) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (!isValidId( req.params.id )) and run the matching branch.
      if (
        !isValidId(
          req.params.id
        )
      ) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID.",
        });
      }

      // Declare booking for use by the surrounding module or function.
      const booking =
        await Booking.findOne(
          mergeTenantFilter({
            _id: req.params.id,
          })
        ).populate(
          "customer",
          "firstName lastName email phone user"
        );

      // Check the condition (!booking) and run the matching branch.
      if (!booking) {
        // Return the result of res.status(404).json() to the caller.
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      // Declare { type, channel, } for use by the surrounding module or function.
      const {
        type,
        channel,
      } = req.body;

      // Declare allowedTypes for use by the surrounding module or function.
      const allowedTypes = [
        "confirmation",
        "payment_reminder",
        "trip_reminder",
        "booking",
        "payment",
        "tour_update",
        "alert",
      ];

      // Declare allowedChannels for use by the surrounding module or function.
      const allowedChannels = [
        "sms",
        "whatsapp",
        "email",
        "in_app",
      ];

      // Check the condition (!allowedTypes.includes( type )) and run the matching branch.
      if (
        !allowedTypes.includes(
          type
        )
      ) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification type.",
        });
      }

      // Check the condition (!allowedChannels.includes( channel )) and run the matching branch.
      if (
        !allowedChannels.includes(
          channel
        )
      ) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification channel.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | RECIPIENT
      |--------------------------------------------------------------------------
      */

      // Declare recipient for use by the surrounding module or function.
      const recipient =
        booking.user ||
        booking.customer?.user ||
        null;

      /*
      |--------------------------------------------------------------------------
      | CONTACT
      |--------------------------------------------------------------------------
      */

      // Declare contact for use by the surrounding module or function.
      const contact =
        getBookingContact(
          booking
        );

      /*
      |--------------------------------------------------------------------------
      | MESSAGE
      |--------------------------------------------------------------------------
      */

      // Declare title for use by the surrounding module or function.
      let title =
        "Booking Notification";

      // Declare message for use by the surrounding module or function.
      let message =
        "There is an update regarding your booking.";

      // Check the condition (type === "confirmation") and run the matching branch.
      if (
        type === "confirmation"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Booking Confirmed";

        // Perform the side effect or state update expressed on the following line.
        message =
          `Your booking ${booking.bookingNumber} has been confirmed.`;
      }

      // Check the condition (type === "payment_reminder") and run the matching branch.
      if (
        type === "payment_reminder"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Payment Reminder";

        // Perform the side effect or state update expressed on the following line.
        message =
          `Payment reminder for booking ${booking.bookingNumber}.`;
      }

      // Check the condition (type === "trip_reminder") and run the matching branch.
      if (
        type === "trip_reminder"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Trip Reminder";

        // Perform the side effect or state update expressed on the following line.
        message =
          `Your trip departure reminder for ${booking.travelDate}.`;
      }

      // Check the condition (type === "booking") and run the matching branch.
      if (
        type === "booking"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Booking Update";

        // Perform the side effect or state update expressed on the following line.
        message =
          `There is an update to booking ${booking.bookingNumber}.`;
      }

      // Check the condition (type === "payment") and run the matching branch.
      if (
        type === "payment"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Payment Update";

        // Perform the side effect or state update expressed on the following line.
        message =
          `There is a payment update for booking ${booking.bookingNumber}.`;
      }

      // Check the condition (type === "tour_update") and run the matching branch.
      if (
        type === "tour_update"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Tour Update";

        // Perform the side effect or state update expressed on the following line.
        message =
          `There is a tour update for booking ${booking.bookingNumber}.`;
      }

      // Check the condition (type === "alert") and run the matching branch.
      if (
        type === "alert"
      ) {
        // Perform the side effect or state update expressed on the following line.
        title =
          "Booking Alert";

        // Perform the side effect or state update expressed on the following line.
        message =
          `There is an important alert for booking ${booking.bookingNumber}.`;
      }

      /*
      |--------------------------------------------------------------------------
      | IN-APP
      |--------------------------------------------------------------------------
      */

      // Declare notification for use by the surrounding module or function.
      let notification =
        null;

      // Check the condition (channel === "in_app") and run the matching branch.
      if (
        channel === "in_app"
      ) {
        // Check the condition (!recipient) and run the matching branch.
        if (!recipient) {
          // Return the result of res.status(400).json() to the caller.
          return res.status(400).json({
            success: false,
            message:
              "This customer does not have a user account for in-app notifications.",
          });
        }

        // Perform the side effect or state update expressed on the following line.
        notification =
          await Notification.create({
            recipient,

            user: recipient,

            title,

            message,

            type:
              getNotificationType(
                type
              ),

            priority:
              type === "alert"
                ? "high"
                : "normal",

            read: false,

            actionUrl:
              `/bookings/${booking._id}`,

            relatedModel:
              "Booking",

            relatedId:
              booking._id,

            metadata: {
              bookingId:
                booking._id,
              bookingNumber:
                booking.bookingNumber,
              channel,
            },

            isSent: true,

            isArchived: false,
          });
      }

      /*
      |--------------------------------------------------------------------------
      | SMS
      |--------------------------------------------------------------------------
      */

      // Check the condition (channel === "sms") and run the matching branch.
      if (
        channel === "sms"
      ) {
        // Check the condition (!contact.phone) and run the matching branch.
        if (!contact.phone) {
          // Return the result of res.status(400).json() to the caller.
          return res.status(400).json({
            success: false,
            message:
              "Customer phone number is unavailable.",
          });
        }

        // Perform the side effect or state update expressed on the following line.
        await sendSMS(
          contact.phone,
          message
        );
      }

      /*
      |--------------------------------------------------------------------------
      | WHATSAPP
      |--------------------------------------------------------------------------
      */

      // Check the condition (channel === "whatsapp") and run the matching branch.
      if (
        channel === "whatsapp"
      ) {
        // Check the condition (!contact.phone) and run the matching branch.
        if (!contact.phone) {
          // Return the result of res.status(400).json() to the caller.
          return res.status(400).json({
            success: false,
            message:
              "Customer phone number is unavailable.",
          });
        }

        // Perform the side effect or state update expressed on the following line.
        await sendWhatsApp(
          contact.phone,
          message
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EMAIL
      |--------------------------------------------------------------------------
      */

      // Check the condition (channel === "email") and run the matching branch.
      if (
        channel === "email"
      ) {
        // Check the condition (!contact.email) and run the matching branch.
        if (!contact.email) {
          // Return the result of res.status(400).json() to the caller.
          return res.status(400).json({
            success: false,
            message:
              "Customer email address is unavailable.",
          });
        }

        // Perform the side effect or state update expressed on the following line.
        await sendEmail({
          to: contact.email,
          subject: title,
          text: message,
          html: `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>`,
        });
      }

      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({
        success: true,
        message:
          "Booking notification sent successfully.",
        notification,
        channel,
      });

    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default {
  getNotifications,
  getMyNotifications,
  markRead,
  sendBookingNotification,
};
