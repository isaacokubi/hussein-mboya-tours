/**
 * Purpose: customer Communication Service business-logic service. Main declarations: cleanName, bookingContact, escapeHtml, formatDate, company.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Booking from "../models/Booking.js";
// Load ../models/Subscription.js so this module can use its exported dependencies.
import Subscription from "../models/Subscription.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ./emailService.js so this module can use its exported dependencies.
import { sendEmail } from "./emailService.js";
// Load ./whatsappService.js so this module can use its exported dependencies.
import { sendWhatsApp } from "./whatsappService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ./settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "./settingsService.js";
// Load ../utils/createInvoice.js so this module can use its exported dependencies.
import { createInvoice } from "../utils/createInvoice.js";
// Load fs/promises so this module can use its exported dependencies.
import fs from "fs/promises";
// Load path so this module can use its exported dependencies.
import path from "path";

// Declare EVENT_TYPES for use by the surrounding module or function.
const EVENT_TYPES = Object.freeze({ BOOKING_CONFIRMATION: "booking_confirmation", PAYMENT_REMINDER: "payment_reminder", TOUR_REMINDER: "tour_reminder", TOUR_VOUCHER: "tour_voucher", SUBSCRIPTION_7: "subscription_7_days", SUBSCRIPTION_3: "subscription_3_days", SUBSCRIPTION_1: "subscription_1_day", SUBSCRIPTION_EXPIRED: "subscription_expired" });

// Declare cleanName for use by the surrounding module or function.
const cleanName = (...values) => {
  // Repeat the enclosed work for each required iteration.
  for (const value of values) {
    // Declare name for use by the surrounding module or function.
    const name = String(value ?? "").replace(/\s+/g, " ").trim();
    // Check the condition (name && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(name)) and run the matching branch.
    if (name && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(name)) return name;
  }
  // Return a configured text value to the caller.
  return "Customer";
};

// Declare bookingContact for use by the surrounding module or function.
const bookingContact = (booking) => ({
  name: cleanName(
    booking.customerSnapshot?.name,
    [booking.customerSnapshot?.firstName, booking.customerSnapshot?.lastName].filter(Boolean).join(" "),
    booking.contact?.name,
    [booking.contact?.firstName, booking.contact?.lastName].filter(Boolean).join(" "),
    booking.customer?.name,
    booking.user?.name
  ),
  email: String(booking.customerSnapshot?.email || booking.contact?.email || booking.customer?.email || booking.user?.email || "").trim(),
  phone: String(booking.customerSnapshot?.phone || booking.contact?.phone || booking.customer?.phone || booking.user?.phone || "").trim()
});
// Declare escapeHtml for use by the surrounding module or function.
const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "Not specified";
// Declare company for use by the surrounding module or function.
const company = async (tenantId = null) => (await getSystemSettings(tenantId ? { tenantId } : {})).companyName || "Global Tours";
// Declare platform for use by the surrounding module or function.
const platform = (fn) => runWithTenant({ role: "super_admin", bypass: true }, fn);
// Declare alreadySent for use by the surrounding module or function.
const alreadySent = async (tenantId, eventKey) => Boolean(await platform(() => Notification.exists({ tenantId, "metadata.eventKey": eventKey })));

// Declare recordInApp for use by the surrounding module or function.
const recordInApp = async ({ tenantId, recipient, title, message, type, eventKey, relatedId }) => {
  // Check the condition (!recipient || await alreadySent(tenantId, eventKey)) and run the matching branch.
  if (!recipient || await alreadySent(tenantId, eventKey)) return null;
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ tenantId, role: "system" }, () => Notification.create({ tenantId, recipient, user: recipient, title, message, type, metadata: { eventKey, automation: true }, relatedModel: relatedId ? "Booking" : null, relatedId: relatedId || null, isSent: true }));
};

// Declare deliver for use by the surrounding module or function.
const deliver = async ({ booking, eventKey, title, message, emailSubject, html, attachments = [], type = "booking" }) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = booking.tenantId;
  // Check the condition (await alreadySent(tenantId, eventKey)) and run the matching branch.
  if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };
  // Declare contact for use by the surrounding module or function.
  const contact = bookingContact(booking);
  // Declare tasks for use by the surrounding module or function.
  const tasks = [];
  // Check the condition (contact.email) and run the matching branch.
  if (contact.email) tasks.push(sendEmail({ to: contact.email, subject: emailSubject, html, text: message, attachments }));
  // Check the condition (contact.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_) and run the matching branch.
  if (contact.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_ACCESS_TOKEN) tasks.push(sendWhatsApp({ to: contact.phone, message }));
  // Check the condition (booking.user) and run the matching branch.
  if (booking.user) tasks.push(recordInApp({ tenantId, recipient: booking.user, title, message, type, eventKey, relatedId: booking._id }));
  // Declare results for use by the surrounding module or function.
  const results = await Promise.allSettled(tasks);
  // Declare failures for use by the surrounding module or function.
  const failures = results.filter((result) => result.status === "rejected");
  // Check the condition (failures.length === results.length && results.length) and run the matching branch.
  if (failures.length === results.length && results.length) throw failures[0].reason;
  // Return the object assembled below to the caller.
  return { sent: results.length - failures.length, failed: failures.length, eventKey };
};

// Declare sendBookingConfirmationAutomation for use by the surrounding module or function.
export const sendBookingConfirmationAutomation = async (booking) => {
  // Declare name for use by the surrounding module or function.
  const name = bookingContact(booking).name;
  // Declare companyName for use by the surrounding module or function.
  const companyName = await company(booking.tenantId);
  // Declare eventKey for use by the surrounding module or function.
  const eventKey = `${booking._id}:${EVENT_TYPES.BOOKING_CONFIRMATION}`;
  // Declare invoicePath for use by the surrounding module or function.
  let invoicePath = "";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (bookingContact(booking).email) and run the matching branch.
    if (bookingContact(booking).email) {
      // Declare uploadDir for use by the surrounding module or function.
      const uploadDir = path.resolve("uploads");
      // Perform the side effect or state update expressed on the following line.
      await fs.mkdir(uploadDir, { recursive: true });
      // Perform the side effect or state update expressed on the following line.
      invoicePath = path.join(uploadDir, `automation-invoice-${booking.bookingNumber || booking._id}.pdf`);
      // Perform the side effect or state update expressed on the following line.
      await createInvoice({ booking, filePath: invoicePath });
    }
    // Return the completed the result of deliver() operation to the caller.
    return await deliver({ booking, eventKey, title: "Booking Confirmed", message: `Hello ${name}, your booking ${booking.bookingNumber || ""} with ${companyName} is confirmed for ${formatDate(booking.travelDate)}. Your invoice is included by email where available.`, emailSubject: `Booking Confirmation - ${companyName}`, attachments: invoicePath ? [{ filename: `Invoice-${booking.bookingNumber || booking._id}.pdf`, path: invoicePath }] : [], html: `<h2>Booking Confirmed</h2><p>Hello ${escapeHtml(name)},</p><p>Your booking <strong>${escapeHtml(booking.bookingNumber || "Pending")}</strong> is confirmed.</p><p><strong>Travel date:</strong> ${escapeHtml(formatDate(booking.travelDate))}</p><p><strong>Total:</strong> ${escapeHtml(booking.totalAmount ?? booking.amount ?? "0")}.</p><p>Your invoice is attached to this email.</p><p>Thank you for choosing ${escapeHtml(companyName)}.</p>`, type: "booking" });
  } finally {
    // Check the condition (invoicePath) and run the matching branch.
    if (invoicePath) await fs.unlink(invoicePath).catch(() => {});
  }
};

// Declare sendPaymentReminderAutomation for use by the surrounding module or function.
export const sendPaymentReminderAutomation = async (booking) => {
  // Declare name for use by the surrounding module or function.
  const name = bookingContact(booking).name;
  // Declare companyName for use by the surrounding module or function.
  const companyName = await company(booking.tenantId);
  // Declare eventKey for use by the surrounding module or function.
  const eventKey = `${booking._id}:${EVENT_TYPES.PAYMENT_REMINDER}:${new Date().toISOString().slice(0, 10)}`;
  // Return the result of deliver() to the caller.
  return deliver({ booking, eventKey, title: "Payment Reminder", message: `Hello ${name}, this is a payment reminder for booking ${booking.bookingNumber || ""}. Please contact ${companyName} if you need assistance.`, emailSubject: `Payment Reminder - ${booking.bookingNumber || "Booking"}`, html: `<h2>Payment Reminder</h2><p>Hello ${escapeHtml(name)},</p><p>Payment is still pending for booking <strong>${escapeHtml(booking.bookingNumber || "")}</strong>.</p><p>Travel date: ${escapeHtml(formatDate(booking.travelDate))}</p><p>Please contact ${escapeHtml(companyName)} if you need assistance.</p>`, type: "payment" });
};

// Declare sendTourReminderAutomation for use by the surrounding module or function.
export const sendTourReminderAutomation = async (booking) => {
  // Declare name for use by the surrounding module or function.
  const name = bookingContact(booking).name;
  // Declare companyName for use by the surrounding module or function.
  const companyName = await company(booking.tenantId);
  // Declare eventKey for use by the surrounding module or function.
  const eventKey = `${booking._id}:${EVENT_TYPES.TOUR_REMINDER}:${new Date(booking.travelDate).toISOString().slice(0, 10)}`;
  // Return the result of deliver() to the caller.
  return deliver({ booking, eventKey, title: "Tour Reminder", message: `Hello ${name}, your ${booking.tour?.title || "tour"} with ${companyName} is coming up on ${formatDate(booking.travelDate)}. We look forward to welcoming you.`, emailSubject: `Tour Reminder - ${booking.bookingNumber || "Booking"}`, html: `<h2>Your Tour Is Coming Up</h2><p>Hello ${escapeHtml(name)},</p><p>Your <strong>${escapeHtml(booking.tour?.title || "tour")}</strong> is scheduled for <strong>${escapeHtml(formatDate(booking.travelDate))}</strong>.</p><p>We look forward to welcoming you.</p>`, type: "tour_update" });
};

// Declare sendTourVoucherAutomation for use by the surrounding module or function.
export const sendTourVoucherAutomation = async (booking) => {
  // Declare name for use by the surrounding module or function.
  const name = bookingContact(booking).name;
  // Declare companyName for use by the surrounding module or function.
  const companyName = await company(booking.tenantId);
  // Declare eventKey for use by the surrounding module or function.
  const eventKey = `${booking._id}:${EVENT_TYPES.TOUR_VOUCHER}`;
  // Return the result of deliver() to the caller.
  return deliver({ booking, eventKey, title: "Tour Voucher Ready", message: `Your tour voucher for booking ${booking.bookingNumber || ""} is ready. Please keep your booking number available when travelling.`, emailSubject: `Tour Voucher - ${booking.bookingNumber || "Booking"}`, html: `<h2>Tour Voucher</h2><p>Hello ${escapeHtml(name)},</p><p>Your tour voucher is ready.</p><p><strong>Booking:</strong> ${escapeHtml(booking.bookingNumber || "")}</p><p><strong>Tour:</strong> ${escapeHtml(booking.tour?.title || "Tour")}</p><p><strong>Travel date:</strong> ${escapeHtml(formatDate(booking.travelDate))}</p><p>Regards,<br>${escapeHtml(companyName)}</p>`, type: "booking" });
};

// Declare subscriptionRecipients for use by the surrounding module or function.
const subscriptionRecipients = async (tenantId) => platform(() => User.find({ tenantId, status: "active", isActive: { $ne: false }, role: { $in: ["admin", "administrator", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }).select("_id email phone name").lean());

// Declare sendSubscriptionReminderAutomation for use by the surrounding module or function.
export const sendSubscriptionReminderAutomation = async ({ subscription, daysRemaining, expired = false }) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = subscription.tenantId;
  // Declare eventType for use by the surrounding module or function.
  const eventType = expired ? EVENT_TYPES.SUBSCRIPTION_EXPIRED : ({ 7: EVENT_TYPES.SUBSCRIPTION_7, 3: EVENT_TYPES.SUBSCRIPTION_3, 1: EVENT_TYPES.SUBSCRIPTION_1 }[daysRemaining] || `subscription_${daysRemaining}_days`);
  // Declare eventKey for use by the surrounding module or function.
  const eventKey = `${tenantId}:${eventType}:${new Date().toISOString().slice(0, 10)}`;
  // Check the condition (await alreadySent(tenantId, eventKey)) and run the matching branch.
  if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };
  // Declare organization for use by the surrounding module or function.
  const organization = await platform(() => Organization.findById(tenantId).select("name subscription status").lean());
  // Declare companyName for use by the surrounding module or function.
  const companyName = organization?.name || "Your tour company";
  // Declare recipients for use by the surrounding module or function.
  const recipients = await subscriptionRecipients(tenantId);
  // Declare title for use by the surrounding module or function.
  const title = expired ? "Subscription Expired" : `Subscription Expires in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}`;
  // Declare message for use by the surrounding module or function.
  const message = expired ? `${companyName}'s subscription has expired. Please renew to restore platform access.` : `${companyName}'s ${subscription.plan} subscription expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`;
  // Perform the side effect or state update expressed on the following line.
  await Promise.all(recipients.map(async (user) => {
    // Check the condition (user.email) and run the matching branch.
    if (user.email) await sendEmail({ to: user.email, subject: title, text: message, html: `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>` }).catch((error) => console.error("Subscription email failed:", error.message));
    // Check the condition (user.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_ACC) and run the matching branch.
    if (user.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_ACCESS_TOKEN) await sendWhatsApp({ to: user.phone, message }).catch((error) => console.error("Subscription WhatsApp failed:", error.message));
    // Perform the side effect or state update expressed on the following line.
    await recordInApp({ tenantId, recipient: user._id, title, message, type: "alert", eventKey: `${eventKey}:${user._id}`, relatedId: null });
  }));
  // Return the object assembled below to the caller.
  return { sent: recipients.length, eventKey };
};

// Declare runCommunicationAutomation for use by the surrounding module or function.
export const runCommunicationAutomation = async () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare recent for use by the surrounding module or function.
  const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Declare sevenDays for use by the surrounding module or function.
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Declare bookings for use by the surrounding module or function.
  const bookings = await platform(() => Booking.find({ $or: [{ createdAt: { $gte: recent } }, { travelDate: { $gte: now, $lte: sevenDays } }], status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }).populate("tour", "title").lean());
  // Repeat the enclosed work for each required iteration.
  for (const booking of bookings) {
    // Declare bookingStatus for use by the surrounding module or function.
    const bookingStatus = String(booking.status || "").toLowerCase();
    // Declare paymentStatus for use by the surrounding module or function.
    const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
    // Check the condition (new Date(booking.createdAt || 0) >= recent && (bookingStatus === "conf) and run the matching branch.
    if (new Date(booking.createdAt || 0) >= recent && (bookingStatus === "confirmed" || ["paid", "completed"].includes(paymentStatus))) await sendBookingConfirmationAutomation(booking).catch((error) => console.error("Booking confirmation automation failed:", error.message));
    // Declare travel for use by the surrounding module or function.
    const travel = new Date(booking.travelDate);
    // Declare hours for use by the surrounding module or function.
    const hours = (travel.getTime() - now.getTime()) / 3600000;
    // Check the condition (hours >= 23 && hours <= 49) and run the matching branch.
    if (hours >= 23 && hours <= 49) await sendTourReminderAutomation(booking).catch((error) => console.error("Tour reminder failed:", error.message));
    // Check the condition (booking.paymentStatus && !["paid", "completed"].includes(paymentStatus) and run the matching branch.
    if (booking.paymentStatus && !["paid", "completed"].includes(paymentStatus)) await sendPaymentReminderAutomation(booking).catch((error) => console.error("Payment reminder failed:", error.message));
  }
  // Declare paidBookings for use by the surrounding module or function.
  const paidBookings = await platform(() => Booking.find({ paymentStatus: { $in: ["paid", "completed"] }, travelDate: { $gte: now, $lte: sevenDays }, status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }).populate("tour", "title").lean());
  // Repeat the enclosed work for each required iteration.
  for (const booking of paidBookings) await sendTourVoucherAutomation(booking).catch((error) => console.error("Tour voucher automation failed:", error.message));
  // Declare subscriptions for use by the surrounding module or function.
  const subscriptions = await platform(() => Subscription.find({ status: { $in: ["trialing", "active"] }, currentPeriodEndsAt: { $ne: null } }).lean());
  // Repeat the enclosed work for each required iteration.
  for (const subscription of subscriptions) {
    // Declare days for use by the surrounding module or function.
    const days = Math.ceil((new Date(subscription.currentPeriodEndsAt).getTime() - now.getTime()) / 86400000);
    // Check the condition ([7, 3, 1].includes(days)) and run the matching branch.
    if ([7, 3, 1].includes(days)) await sendSubscriptionReminderAutomation({ subscription, daysRemaining: days }).catch((error) => console.error("Subscription reminder failed:", error.message));
  }
};

// Expose the selected declarations or re-exported members to other parts of the application.
export { EVENT_TYPES };
