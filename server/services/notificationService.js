/**
 * Purpose: notification Service business-logic service. Main declarations: createNotification, sendNotification, notifyUser, sendBookingConfirmation, sendBookingNotification.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// services/notificationService.js
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";

// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";

// Load ./emailService.js so this module can use its exported dependencies.
import { sendEmail } from "./emailService.js";

// Load ../socket/socketManager.js so this module can use its exported dependencies.
import { sendNotificationToUser } from "../socket/socketManager.js";

/*
|--------------------------------------------------------------------------
| CREATE NOTIFICATION
|--------------------------------------------------------------------------
*/

// Declare createNotification for use by the surrounding module or function.
export const createNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  metadata = {},
}) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!recipient) and run the matching branch.
  if (!recipient) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Notification recipient is required.");
  }

  // Check the condition (!title) and run the matching branch.
  if (!title) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Notification title is required.");
  }

  // Check the condition (!message) and run the matching branch.
  if (!message) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Notification message is required.");
  }

  // Declare notification for use by the surrounding module or function.
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    metadata,
  });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    sendNotificationToUser(
      recipient.toString(),
      "notification",
      notification
    );
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Socket notification failed:", error.message);
  }

  // Return the value of notification to the caller.
  return notification;
};

/*
|--------------------------------------------------------------------------
| GENERIC NOTIFICATION
|--------------------------------------------------------------------------
*/

// Declare sendNotification for use by the surrounding module or function.
export const sendNotification = async (data) => {
  // Return the result of createNotification() to the caller.
  return createNotification(data);
};

/*
|--------------------------------------------------------------------------
| SEND EMAIL + APP NOTIFICATION
|--------------------------------------------------------------------------
*/

// Declare notifyUser for use by the surrounding module or function.
export const notifyUser = async ({
  user,
  subject,
  html,
  title,
  message,
  type = "system",
  metadata = {},
}) => {
  // Declare tasks for use by the surrounding module or function.
  const tasks = [];

  // Check the condition (user?.email) and run the matching branch.
  if (user?.email) {
    // Perform the side effect or state update expressed on the following line.
    tasks.push(
      sendEmail({
        to: user.email,
        subject,
        html,
      }).catch((error) => {
        // Perform the side effect or state update expressed on the following line.
        console.error("Email failed:", error.message);
      })
    );
  }

  // Perform the side effect or state update expressed on the following line.
  tasks.push(
    createNotification({
      recipient: user._id,
      title,
      message,
      type,
      metadata,
    })
  );

  // Perform the side effect or state update expressed on the following line.
  await Promise.all(tasks);
};

/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION
|--------------------------------------------------------------------------
*/

// Declare sendBookingConfirmation for use by the surrounding module or function.
export const sendBookingConfirmation = async (
  user,
  booking
) => {
  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings();
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || "Company";

  // Perform the side effect or state update expressed on the following line.
  await notifyUser({
    user,

    subject: `Booking Confirmed - ${companyName}`,

    html: `
      <h2>Your booking is confirmed 🎉</h2>

      <p>
        Booking Number:
        <strong>${booking.bookingNumber}</strong>
      </p>

      <p>
        Thank you for choosing ${companyName}.
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

// Declare sendBookingNotification for use by the surrounding module or function.
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

// Declare sendPaymentNotification for use by the surrounding module or function.
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

// Declare sendTourAssignmentNotification for use by the surrounding module or function.
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

// Declare notifyPaymentSuccess for use by the surrounding module or function.
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



// Expose the selected declarations or re-exported members to other parts of the application.
export { sendEmail };
