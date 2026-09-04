import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";
import { sendNotificationToUser } from "../socket/socketManager.js";

const assertRecipientInTenant = async (recipient) => {
  const tenantId = requireTenantId();
  const recipientId = recipient?.toString?.() || String(recipient || "");
  if (!recipientId) throw new Error("Notification recipient is required.");

  const user = await User.findOne(
    mergeTenantFilter({ _id: recipientId })
  ).select("_id tenantId status").lean();

  if (!user) throw new Error("Notification recipient does not belong to the active tenant.");
  if (String(user.tenantId || "") !== String(tenantId)) {
    throw new Error("Cross-tenant notification rejected.");
  }

  return user;
};

export const createNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  metadata = {},
  relatedModel = null,
  relatedId = null,
}) => {
  const tenantId = requireTenantId();

  if (!recipient) throw new Error("Notification recipient is required.");
  if (!title) throw new Error("Notification title is required.");
  if (!message) throw new Error("Notification message is required.");

  await assertRecipientInTenant(recipient);

  const notification = await Notification.create({
    tenantId,
    recipient,
    user: recipient,
    title,
    message,
    type,
    metadata,
    relatedModel,
    relatedId,
  });

  try {
    sendNotificationToUser(recipient.toString(), "notification", notification);
  } catch (error) {
    console.error("Socket notification failed:", error.message);
  }

  return notification;
};

export const sendNotification = async (data) => createNotification(data);

export const notifyUser = async ({
  user,
  subject,
  html,
  title,
  message,
  type = "system",
  metadata = {},
  relatedModel = null,
  relatedId = null,
}) => {
  const tasks = [];

  if (user?.email) {
    tasks.push(
      sendEmail({ to: user.email, subject, html }).catch((error) => {
        console.error("Email failed:", error.message);
      })
    );
  }

  tasks.push(
    createNotification({
      recipient: user?._id,
      title,
      message,
      type,
      metadata,
      relatedModel,
      relatedId,
    })
  );

  await Promise.all(tasks);
};

export const sendBookingConfirmation = async (user, booking) => {
  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";

  await notifyUser({
    user,
    subject: `Booking Confirmed - ${companyName}`,
    html: `<h2>Your booking is confirmed 🎉</h2><p>Booking Number: <strong>${booking.bookingNumber}</strong></p><p>Thank you for choosing ${companyName}.</p>`,
    title: "Booking Confirmed",
    message: "Your travel booking has been confirmed.",
    type: "booking",
    relatedModel: "Booking",
    relatedId: booking._id,
    metadata: { bookingId: booking._id },
  });
};

export const sendBookingNotification = async ({ adminUserId, customer, booking }) =>
  sendNotification({
    recipient: adminUserId,
    title: "New Booking",
    message: `${customer.name} created a booking.`,
    type: "booking",
    relatedModel: "Booking",
    relatedId: booking._id,
    metadata: { bookingId: booking._id },
  });

export const sendPaymentNotification = async ({ adminUserId, booking }) =>
  sendNotification({
    recipient: adminUserId,
    title: "Payment Received",
    message: `Booking ${booking.bookingNumber} has been paid.`,
    type: "payment",
    relatedModel: "Booking",
    relatedId: booking._id,
    metadata: { bookingId: booking._id },
  });

export const sendTourAssignmentNotification = async ({ guideUserId, tour }) =>
  sendNotification({
    recipient: guideUserId,
    title: "New Tour Assignment",
    message: `${tour.title} has been assigned to you.`,
    type: "tour_assignment",
    relatedModel: "Tour",
    relatedId: tour._id,
    metadata: { tourId: tour._id },
  });

export const notifyPaymentSuccess = async (user, payment) =>
  sendNotification({
    recipient: user._id,
    title: "Payment Successful",
    message: "Your payment has been received successfully.",
    type: "payment",
    relatedModel: "Payment",
    relatedId: payment._id,
    metadata: { paymentId: payment._id },
  });

export { sendEmail };
