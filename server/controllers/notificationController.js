import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Notification from "../models/Notification.js";
import Role from "../models/Role.js";

import {
  sendSMS,
} from "../services/smsService.js";

import {
  sendWhatsApp,
} from "../services/whatsappService.js";

import {
  sendEmail,
} from "../services/emailService.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

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

const getNotificationType = (type) => {
  if (
    type === "confirmation" ||
    type === "booking"
  ) {
    return "booking";
  }

  if (
    type === "payment" ||
    type === "payment_reminder"
  ) {
    return "payment";
  }

  if (
    type === "tour_update" ||
    type === "trip_reminder"
  ) {
    return "tour_update";
  }

  return "alert";
};



const normalizeRole = (value) =>
  String(
    typeof value === "object"
      ? value?.name || value?.role || ""
      : value || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const requesterCanSendStaffNotifications = (user) =>
  ["admin", "superadmin", "administrator", "tourmanager", "manager"].includes(
    normalizeRole(user?.roleId?.name || user?.role || user?.legacyRole)
  );

/*
|--------------------------------------------------------------------------
| STAFF / INTERNAL NOTIFICATION RECIPIENTS
|--------------------------------------------------------------------------
*/

export const getNotificationRecipients = async (req, res, next) => {
  requireTenantId();
  try {
    if (!requesterCanSendStaffNotifications(req.user)) {
      return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });
    }

    const requested = String(req.query.roles || "guide,driver,agent,admin,manager")
      .split(",")
      .map((v) => normalizeRole(v))
      .filter(Boolean);

    const roleMap = {
      guide: ["guide", "tourguide"],
      tourguide: ["guide", "tourguide"],
      driver: ["driver"],
      agent: ["agent", "travelagent"],
      admin: ["admin", "superadmin", "administrator"],
      manager: ["manager", "tourmanager", "tour_manager"],
      tourmanager: ["manager", "tourmanager", "tour_manager"],
    };

    const allowedRoles = [...new Set(requested.flatMap((r) => roleMap[r] || []))];
    const roleDocs = await Role.find({ name: { $in: allowedRoles } }).select("_id").lean();
    const roleIds = roleDocs.map((role) => role._id);

    const users = await User.find({
      $or: [
        { role: { $in: allowedRoles } },
        { legacyRole: { $in: allowedRoles } },
        ...(roleIds.length ? [{ roleId: { $in: roleIds } }] : []),
      ],
      status: "active",
      isActive: { $ne: false },
    })
      .select("_id name firstName lastName email phone role legacyRole roleId")
      .populate("roleId", "name displayName")
      .sort({ name: 1, email: 1 })
      .lean();

    const staff = await Staff.find({
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
    }).select("user name email phone position").lean();

    const linkedIds = new Set(users.map((u) => u._id.toString()));
    const extra = [];

    for (const member of staff) {
      if (member.user && !linkedIds.has(member.user.toString())) {
        const user = await User.findById(member.user)
          .select("_id name firstName lastName email phone role legacyRole roleId")
          .populate("roleId", "name displayName")
          .lean();
        if (user && user.status === "active" && user.isActive !== false) {
          extra.push(user);
          linkedIds.add(user._id.toString());
        }
      }
    }

    return res.json({
      success: true,
      recipients: [...users, ...extra],
    });
  } catch (error) {
    next(error);
  }
};

export const sendInternalNotification = async (req, res, next) => {
  try {
    if (!requesterCanSendStaffNotifications(req.user)) {
      return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });
    }

    const {
      recipientIds = [],
      roles = [],
      title,
      message,
      type = "system",
      priority = "normal",
      actionUrl = "",
    } = req.body || {};

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    const normalizedIds = Array.isArray(recipientIds)
      ? recipientIds.filter((id) => isValidId(id))
      : [];

    const normalizedRoles = Array.isArray(roles)
      ? roles.map(normalizeRole).filter(Boolean)
      : [];

    const roleMap = {
      guide: ["guide", "tourguide"],
      tourguide: ["guide", "tourguide"],
      driver: ["driver"],
      agent: ["agent", "travelagent"],
      admin: ["admin", "superadmin", "administrator"],
      manager: ["manager", "tourmanager", "tour_manager"],
      tourmanager: ["manager", "tourmanager", "tour_manager"],
    };

    const expandedRoles = [...new Set(normalizedRoles.flatMap((r) => roleMap[r] || []))];

    const filter = [];
    if (normalizedIds.length) filter.push({ _id: { $in: normalizedIds } });
    if (expandedRoles.length) {
      filter.push(
        { role: { $in: expandedRoles } },
        { legacyRole: { $in: expandedRoles } }
      );
    }

    if (!filter.length) {
      return res.status(400).json({ success: false, message: "Select at least one recipient or recipient group." });
    }

    const roleDocs = expandedRoles.length
      ? await Role.find({ name: { $in: expandedRoles } }).select("_id").lean()
      : [];
    const roleIds = roleDocs.map((role) => role._id);
    if (roleIds.length) filter.push({ roleId: { $in: roleIds } });

    const recipients = await User.find({
      $or: filter,
      status: "active",
      isActive: { $ne: false },
    }).select("_id");

    if (!recipients.length) {
      return res.status(404).json({ success: false, message: "No active recipients matched your selection." });
    }

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

    const created = await Notification.insertMany(docs);

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${created.length} recipient${created.length === 1 ? "" : "s"}.`,
      count: created.length,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const getNotifications = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const filter = {
      recipient: req.user._id,
      isArchived: false,
    };

    if (
      req.query.unread === "true"
    ) {
      filter.read = false;
    }

    if (req.query.type) {
      filter.type =
        req.query.type;
    }

    const skip =
      (page - 1) * limit;

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
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MY NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const getMyNotifications =
  getNotifications;

/*
|--------------------------------------------------------------------------
| MARK READ
|--------------------------------------------------------------------------
*/

export const markRead = async (
  req,
  res,
  next
) => {
  try {
    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
        isArchived: false,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found.",
      });
    }

    await notification.markAsRead();

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read.",
      notification,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| SEND BOOKING NOTIFICATION
|--------------------------------------------------------------------------
*/

export const sendBookingNotification =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID.",
        });
      }

      const booking =
        await Booking.findById(
          req.params.id
        ).populate(
          "customer",
          "firstName lastName email phone user"
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      const {
        type,
        channel,
      } = req.body;

      const allowedTypes = [
        "confirmation",
        "payment_reminder",
        "trip_reminder",
        "booking",
        "payment",
        "tour_update",
        "alert",
      ];

      const allowedChannels = [
        "sms",
        "whatsapp",
        "email",
        "in_app",
      ];

      if (
        !allowedTypes.includes(
          type
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification type.",
        });
      }

      if (
        !allowedChannels.includes(
          channel
        )
      ) {
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

      const recipient =
        booking.user ||
        booking.customer?.user ||
        null;

      /*
      |--------------------------------------------------------------------------
      | CONTACT
      |--------------------------------------------------------------------------
      */

      const contact =
        getBookingContact(
          booking
        );

      /*
      |--------------------------------------------------------------------------
      | MESSAGE
      |--------------------------------------------------------------------------
      */

      let title =
        "Booking Notification";

      let message =
        "There is an update regarding your booking.";

      if (
        type === "confirmation"
      ) {
        title =
          "Booking Confirmed";

        message =
          `Your booking ${booking.bookingNumber} has been confirmed.`;
      }

      if (
        type === "payment_reminder"
      ) {
        title =
          "Payment Reminder";

        message =
          `Payment reminder for booking ${booking.bookingNumber}.`;
      }

      if (
        type === "trip_reminder"
      ) {
        title =
          "Trip Reminder";

        message =
          `Your trip departure reminder for ${booking.travelDate}.`;
      }

      if (
        type === "booking"
      ) {
        title =
          "Booking Update";

        message =
          `There is an update to booking ${booking.bookingNumber}.`;
      }

      if (
        type === "payment"
      ) {
        title =
          "Payment Update";

        message =
          `There is a payment update for booking ${booking.bookingNumber}.`;
      }

      if (
        type === "tour_update"
      ) {
        title =
          "Tour Update";

        message =
          `There is a tour update for booking ${booking.bookingNumber}.`;
      }

      if (
        type === "alert"
      ) {
        title =
          "Booking Alert";

        message =
          `There is an important alert for booking ${booking.bookingNumber}.`;
      }

      /*
      |--------------------------------------------------------------------------
      | IN-APP
      |--------------------------------------------------------------------------
      */

      let notification =
        null;

      if (
        channel === "in_app"
      ) {
        if (!recipient) {
          return res.status(400).json({
            success: false,
            message:
              "This customer does not have a user account for in-app notifications.",
          });
        }

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

      if (
        channel === "sms"
      ) {
        if (!contact.phone) {
          return res.status(400).json({
            success: false,
            message:
              "Customer phone number is unavailable.",
          });
        }

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

      if (
        channel === "whatsapp"
      ) {
        if (!contact.phone) {
          return res.status(400).json({
            success: false,
            message:
              "Customer phone number is unavailable.",
          });
        }

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

      if (
        channel === "email"
      ) {
        if (!contact.email) {
          return res.status(400).json({
            success: false,
            message:
              "Customer email address is unavailable.",
          });
        }

        await sendEmail(
          contact.email,
          message
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Booking notification sent successfully.",
        notification,
        channel,
      });

    } catch (error) {
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
