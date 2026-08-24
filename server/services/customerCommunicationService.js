import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";
import { sendWhatsApp } from "./whatsappService.js";
import { runWithTenant } from "../tenancy/context.js";
import { getSystemSettings } from "./settingsService.js";
import { createInvoice } from "../utils/createInvoice.js";
import fs from "fs/promises";
import path from "path";

const EVENT_TYPES = Object.freeze({ BOOKING_CONFIRMATION: "booking_confirmation", PAYMENT_REMINDER: "payment_reminder", TOUR_REMINDER: "tour_reminder", TOUR_VOUCHER: "tour_voucher", SUBSCRIPTION_7: "subscription_7_days", SUBSCRIPTION_3: "subscription_3_days", SUBSCRIPTION_1: "subscription_1_day", SUBSCRIPTION_EXPIRED: "subscription_expired" });
const bookingContact = (booking) => ({ name: booking.customerSnapshot?.name || booking.contact?.name || "Customer", email: booking.customerSnapshot?.email || booking.contact?.email || "", phone: String(booking.customerSnapshot?.phone || booking.contact?.phone || "").trim() });
const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "Not specified";
const company = async (tenantId = null) => (await getSystemSettings(tenantId ? { tenantId } : {})).companyName || "Coherent Tours";
const platform = (fn) => runWithTenant({ role: "super_admin", bypass: true }, fn);
const alreadySent = async (tenantId, eventKey) => Boolean(await platform(() => Notification.exists({ tenantId, "metadata.eventKey": eventKey })));

const recordInApp = async ({ tenantId, recipient, title, message, type, eventKey, relatedId }) => {
  if (!recipient || await alreadySent(tenantId, eventKey)) return null;
  return runWithTenant({ tenantId, role: "system" }, () => Notification.create({ tenantId, recipient, user: recipient, title, message, type, metadata: { eventKey, automation: true }, relatedModel: relatedId ? "Booking" : null, relatedId: relatedId || null, isSent: true }));
};

const deliver = async ({ booking, eventKey, title, message, emailSubject, html, attachments = [], type = "booking" }) => {
  const tenantId = booking.tenantId;
  if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };
  const contact = bookingContact(booking);
  const tasks = [];
  if (contact.email) tasks.push(sendEmail({ to: contact.email, subject: emailSubject, html, text: message, attachments }));
  if (contact.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_ACCESS_TOKEN) tasks.push(sendWhatsApp({ to: contact.phone, message }));
  if (booking.user) tasks.push(recordInApp({ tenantId, recipient: booking.user, title, message, type, eventKey, relatedId: booking._id }));
  const results = await Promise.allSettled(tasks);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length === results.length && results.length) throw failures[0].reason;
  return { sent: results.length - failures.length, failed: failures.length, eventKey };
};

export const sendBookingConfirmationAutomation = async (booking) => {
  const name = bookingContact(booking).name;
  const companyName = await company(booking.tenantId);
  const eventKey = `${booking._id}:${EVENT_TYPES.BOOKING_CONFIRMATION}`;
  let invoicePath = "";
  try {
    if (bookingContact(booking).email) {
      const uploadDir = path.resolve("uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      invoicePath = path.join(uploadDir, `automation-invoice-${booking.bookingNumber || booking._id}.pdf`);
      await createInvoice({ booking, filePath: invoicePath });
    }
    return await deliver({ booking, eventKey, title: "Booking Confirmed", message: `Hello ${name}, your booking ${booking.bookingNumber || ""} with ${companyName} is confirmed for ${formatDate(booking.travelDate)}. Your invoice is included by email where available.`, emailSubject: `Booking Confirmation - ${companyName}`, attachments: invoicePath ? [{ filename: `Invoice-${booking.bookingNumber || booking._id}.pdf`, path: invoicePath }] : [], html: `<h2>Booking Confirmed</h2><p>Hello ${escapeHtml(name)},</p><p>Your booking <strong>${escapeHtml(booking.bookingNumber || "Pending")}</strong> is confirmed.</p><p><strong>Travel date:</strong> ${escapeHtml(formatDate(booking.travelDate))}</p><p><strong>Total:</strong> ${escapeHtml(booking.totalAmount ?? booking.amount ?? "0")}.</p><p>Your invoice is attached to this email.</p><p>Thank you for choosing ${escapeHtml(companyName)}.</p>`, type: "booking" });
  } finally {
    if (invoicePath) await fs.unlink(invoicePath).catch(() => {});
  }
};

export const sendPaymentReminderAutomation = async (booking) => {
  const name = bookingContact(booking).name;
  const companyName = await company(booking.tenantId);
  const eventKey = `${booking._id}:${EVENT_TYPES.PAYMENT_REMINDER}:${new Date().toISOString().slice(0, 10)}`;
  return deliver({ booking, eventKey, title: "Payment Reminder", message: `Hello ${name}, this is a payment reminder for booking ${booking.bookingNumber || ""}. Please contact ${companyName} if you need assistance.`, emailSubject: `Payment Reminder - ${booking.bookingNumber || "Booking"}`, html: `<h2>Payment Reminder</h2><p>Hello ${escapeHtml(name)},</p><p>Payment is still pending for booking <strong>${escapeHtml(booking.bookingNumber || "")}</strong>.</p><p>Travel date: ${escapeHtml(formatDate(booking.travelDate))}</p><p>Please contact ${escapeHtml(companyName)} if you need assistance.</p>`, type: "payment" });
};

export const sendTourReminderAutomation = async (booking) => {
  const name = bookingContact(booking).name;
  const companyName = await company(booking.tenantId);
  const eventKey = `${booking._id}:${EVENT_TYPES.TOUR_REMINDER}:${new Date(booking.travelDate).toISOString().slice(0, 10)}`;
  return deliver({ booking, eventKey, title: "Tour Reminder", message: `Hello ${name}, your ${booking.tour?.title || "tour"} with ${companyName} is coming up on ${formatDate(booking.travelDate)}. We look forward to welcoming you.`, emailSubject: `Tour Reminder - ${booking.bookingNumber || "Booking"}`, html: `<h2>Your Tour Is Coming Up</h2><p>Hello ${escapeHtml(name)},</p><p>Your <strong>${escapeHtml(booking.tour?.title || "tour")}</strong> is scheduled for <strong>${escapeHtml(formatDate(booking.travelDate))}</strong>.</p><p>We look forward to welcoming you.</p>`, type: "tour_update" });
};

export const sendTourVoucherAutomation = async (booking) => {
  const name = bookingContact(booking).name;
  const companyName = await company(booking.tenantId);
  const eventKey = `${booking._id}:${EVENT_TYPES.TOUR_VOUCHER}`;
  return deliver({ booking, eventKey, title: "Tour Voucher Ready", message: `Your tour voucher for booking ${booking.bookingNumber || ""} is ready. Please keep your booking number available when travelling.`, emailSubject: `Tour Voucher - ${booking.bookingNumber || "Booking"}`, html: `<h2>Tour Voucher</h2><p>Hello ${escapeHtml(name)},</p><p>Your tour voucher is ready.</p><p><strong>Booking:</strong> ${escapeHtml(booking.bookingNumber || "")}</p><p><strong>Tour:</strong> ${escapeHtml(booking.tour?.title || "Tour")}</p><p><strong>Travel date:</strong> ${escapeHtml(formatDate(booking.travelDate))}</p><p>Regards,<br>${escapeHtml(companyName)}</p>`, type: "booking" });
};

const subscriptionRecipients = async (tenantId) => platform(() => User.find({ tenantId, status: "active", isActive: { $ne: false }, role: { $in: ["admin", "administrator", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }).select("_id email phone name").lean());

export const sendSubscriptionReminderAutomation = async ({ subscription, daysRemaining, expired = false }) => {
  const tenantId = subscription.tenantId;
  const eventType = expired ? EVENT_TYPES.SUBSCRIPTION_EXPIRED : ({ 7: EVENT_TYPES.SUBSCRIPTION_7, 3: EVENT_TYPES.SUBSCRIPTION_3, 1: EVENT_TYPES.SUBSCRIPTION_1 }[daysRemaining] || `subscription_${daysRemaining}_days`);
  const eventKey = `${tenantId}:${eventType}:${new Date().toISOString().slice(0, 10)}`;
  if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };
  const organization = await platform(() => Organization.findById(tenantId).select("name subscription status").lean());
  const companyName = organization?.name || "Your tour company";
  const recipients = await subscriptionRecipients(tenantId);
  const title = expired ? "Subscription Expired" : `Subscription Expires in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}`;
  const message = expired ? `${companyName}'s subscription has expired. Please renew to restore platform access.` : `${companyName}'s ${subscription.plan} subscription expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`;
  await Promise.all(recipients.map(async (user) => {
    if (user.email) await sendEmail({ to: user.email, subject: title, text: message, html: `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>` }).catch((error) => console.error("Subscription email failed:", error.message));
    if (user.phone && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_ACCESS_TOKEN) await sendWhatsApp({ to: user.phone, message }).catch((error) => console.error("Subscription WhatsApp failed:", error.message));
    await recordInApp({ tenantId, recipient: user._id, title, message, type: "alert", eventKey: `${eventKey}:${user._id}`, relatedId: null });
  }));
  return { sent: recipients.length, eventKey };
};

export const runCommunicationAutomation = async () => {
  const now = new Date();
  const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const bookings = await platform(() => Booking.find({ $or: [{ createdAt: { $gte: recent } }, { travelDate: { $gte: now, $lte: sevenDays } }], status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }).populate("tour", "title").lean());
  for (const booking of bookings) {
    const bookingStatus = String(booking.status || "").toLowerCase();
    const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
    if (new Date(booking.createdAt || 0) >= recent && (bookingStatus === "confirmed" || ["paid", "completed"].includes(paymentStatus))) await sendBookingConfirmationAutomation(booking).catch((error) => console.error("Booking confirmation automation failed:", error.message));
    const travel = new Date(booking.travelDate);
    const hours = (travel.getTime() - now.getTime()) / 3600000;
    if (hours >= 23 && hours <= 49) await sendTourReminderAutomation(booking).catch((error) => console.error("Tour reminder failed:", error.message));
    if (booking.paymentStatus && !["paid", "completed"].includes(paymentStatus)) await sendPaymentReminderAutomation(booking).catch((error) => console.error("Payment reminder failed:", error.message));
  }
  const paidBookings = await platform(() => Booking.find({ paymentStatus: { $in: ["paid", "completed"] }, travelDate: { $gte: now, $lte: sevenDays }, status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }).populate("tour", "title").lean());
  for (const booking of paidBookings) await sendTourVoucherAutomation(booking).catch((error) => console.error("Tour voucher automation failed:", error.message));
  const subscriptions = await platform(() => Subscription.find({ status: { $in: ["trialing", "active"] }, currentPeriodEndsAt: { $ne: null } }).lean());
  for (const subscription of subscriptions) {
    const days = Math.ceil((new Date(subscription.currentPeriodEndsAt).getTime() - now.getTime()) / 86400000);
    if ([7, 3, 1].includes(days)) await sendSubscriptionReminderAutomation({ subscription, daysRemaining: days }).catch((error) => console.error("Subscription reminder failed:", error.message));
  }
};

export { EVENT_TYPES };
