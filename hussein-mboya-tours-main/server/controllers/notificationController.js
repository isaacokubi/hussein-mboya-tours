import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";

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
