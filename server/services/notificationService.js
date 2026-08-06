// services/notificationService.js

import Notification from "../models/Notification.js";

import { sendEmail } from "./emailService.js";

import { io } from "../server.js";

import { getSocketId } from "../socket/socketManager.js";

/*
|--------------------------------------------------------------------------
| CREATE NOTIFICATION
|--------------------------------------------------------------------------
*/

export const createNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  metadata = {},
}) => {
  if (!recipient) {
    throw new Error("Notification recipient is required.");
  }

  if (!title) {
    throw new Error("Notification title is required.");
  }

  if (!message) {
    throw new Error("Notification message is required.");
  }

  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    metadata,
  });

  try {
    const socketId = getSocketId(recipient.toString());

    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }
  } catch (error) {
    console.error("Socket notification failed:", error.message);
  }

  return notification;
};

/*
|--------------------------------------------------------------------------
| GENERIC NOTIFICATION
|--------------------------------------------------------------------------
*/

export const sendNotification = async (data) => {
  return createNotification(data);
};

/*
|--------------------------------------------------------------------------
| SEND EMAIL + APP NOTIFICATION
|--------------------------------------------------------------------------
*/

export const notifyUser = async ({
  user,
  subject,
  html,
  title,
  message,
  type = "system",
  metadata = {},
}) => {
  const tasks = [];

  if (user?.email) {
    tasks.push(
      sendEmail({
        to: user.email,
        subject,
        html,
      }).catch((error) => {
        console.error("Email failed:", error.message);
      })
    );
  }

  tasks.push(
    createNotification({
      recipient: user._id,
      title,
      message,
      type,
      metadata,
    })
  );

  await Promise.all(tasks);
};

/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION
|--------------------------------------------------------------------------
*/

export const sendBookingConfirmation = async (
  user,
  booking
) => {
  await notifyUser({
    user,

    subject: "Booking Confirmed - Coherent Tours",

    html: `
      <h2>Your booking is confirmed 🎉</h2>

      <p>
        Booking Number:
        <strong>${booking.bookingNumber}</strong>
      </p>

      <p>
        Thank you for choosing Coherent Tours.
      </p>
    `,

    title: "Booking Confirmed",

    message:
      "Your travel booking has been confirmed.",

    type: "booking",

    metadata: {
      bookingId: booking._id,
    },
  });
};

/*
|--------------------------------------------------------------------------
| ADMIN BOOKING ALERT
|--------------------------------------------------------------------------
*/

export const sendBookingNotification = async ({
  adminUserId,
  customer,
  booking,
}) =>
  sendNotification({
    recipient: adminUserId,

    title: "New Booking",

    message: `${customer.name} created a booking.`,

    type: "booking",

    metadata: {
      bookingId: booking._id,
    },
  });

/*
|--------------------------------------------------------------------------
| PAYMENT RECEIVED
|--------------------------------------------------------------------------
*/

export const sendPaymentNotification = async ({
  adminUserId,
  booking,
}) =>
  sendNotification({
    recipient: adminUserId,

    title: "Payment Received",

    message: `Booking ${booking.bookingNumber} has been paid.`,

    type: "payment",

    metadata: {
      bookingId: booking._id,
    },
  });

/*
|--------------------------------------------------------------------------
| GUIDE ASSIGNMENT
|--------------------------------------------------------------------------
*/

export const sendTourAssignmentNotification = async ({
  guideUserId,
  tour,
}) =>
  sendNotification({
    recipient: guideUserId,

    title: "New Tour Assignment",

    message: `${tour.title} has been assigned to you.`,

    type: "tour_assignment",

    metadata: {
      tourId: tour._id,
    },
  });

/*
|--------------------------------------------------------------------------
| PAYMENT SUCCESS
|--------------------------------------------------------------------------
*/

export const notifyPaymentSuccess = async (
  user,
  payment
) =>
  sendNotification({
    recipient: user._id,

    title: "Payment Successful",

    message:
      "Your payment has been received successfully.",

    type: "payment",

    metadata: {
      paymentId: payment._id,
    },
  });

