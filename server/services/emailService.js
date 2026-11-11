/**
 * Purpose: email Service business-logic service. Main declarations: escapeHtml, clean, formatDate, money, clientFor.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Resend } from "resend";
// Load fs/promises so this module can use its exported dependencies.
import fs from "fs/promises";
// Load ./settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "./settingsService.js";

// Declare RESEND_TEST_SENDER for use by the surrounding module or function.
export const RESEND_TEST_SENDER = "onboarding@resend.dev";
// Declare EMAIL_PATTERN for use by the surrounding module or function.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Declare resendClient for use by the surrounding module or function.
let resendClient;
// Declare resendClientApiKey for use by the surrounding module or function.
let resendClientApiKey;

// Declare escapeHtml for use by the surrounding module or function.
const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
// Declare clean for use by the surrounding module or function.
const clean = (value, fallback = "Not specified") => {
  // Declare text for use by the surrounding module or function.
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  // Return the expression shown below to the caller.
  return text && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(text) ? text : fallback;
};
// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : "Not specified";
// Declare money for use by the surrounding module or function.
const money = (value) => `KES ${Number(value ?? 0).toLocaleString("en-KE")}`;

// Declare clientFor for use by the surrounding module or function.
const clientFor = (apiKey) => {
  // Render environment changes restart the service, but comparing the key also
  // prevents a stale SDK client if credentials rotate during a warm process.
  // Check the condition (!resendClient || resendClientApiKey !== apiKey) and run the matching branch.
  if (!resendClient || resendClientApiKey !== apiKey) {
    // Perform the side effect or state update expressed on the following line.
    resendClient = new Resend(apiKey);
    // Perform the side effect or state update expressed on the following line.
    resendClientApiKey = apiKey;
  }
  // Return the value of resendClient to the caller.
  return resendClient;
};

// Declare sendEmail for use by the surrounding module or function.
export const sendEmail = async ({ to, subject, html, text, attachments = [], cc, bcc, replyTo, fromName, settingsSource }) => {
  // Check the condition (!to) and run the matching branch.
  if (!to) throw new Error("Recipient email is required.");
  // Check the condition (!subject) and run the matching branch.
  if (!subject) throw new Error("Email subject is required.");
  // Check the condition (!html && !text) and run the matching branch.
  if (!html && !text) throw new Error("Email content is required.");

  // Declare apiKey for use by the surrounding module or function.
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  // Check the condition (!apiKey) and run the matching branch.
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  // Declare sender for use by the surrounding module or function.
  const sender = String(process.env.RESEND_FROM_EMAIL || RESEND_TEST_SENDER).trim();
  // Check the condition (!EMAIL_PATTERN.test(sender)) and run the matching branch.
  if (!EMAIL_PATTERN.test(sender)) throw new Error("RESEND_FROM_EMAIL must be a valid email address.");

  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings(settingsSource);
  // Declare companyName for use by the surrounding module or function.
  const companyName = clean(fromName || process.env.RESEND_FROM_NAME || settings.companyName, "Hussein Mboya Tours");
  // Declare from for use by the surrounding module or function.
  const from = `${companyName.replace(/[<>\r\n]/g, "")} <${sender}>`;
  // Declare { data, error } for use by the surrounding module or function.
  const { data, error } = await clientFor(apiKey).emails.send({ from, to, subject, html, text, attachments, cc, bcc, replyTo });
  // Check the condition (error) and run the matching branch.
  if (error) {
    // Keep provider status for server-side diagnosis without exposing credentials
    // or provider internals to the public API response.
    // Declare statusCode for use by the surrounding module or function.
    const statusCode = Number(error.statusCode || error.status || 0);
    // Stop the current operation by raising a new Error instance.
    throw new Error(statusCode ? `Resend email delivery failed (HTTP ${statusCode}).` : "Resend email delivery failed.");
  }
  // Return the value of data to the caller.
  return data;
};

// Declare bookingEmailAddress for use by the surrounding module or function.
const bookingEmailAddress = (booking) => booking?.contact?.email || booking?.contactEmail || booking?.customerSnapshot?.email || booking?.customer?.email || booking?.user?.email;

// Declare sendBookingConfirmationEmail for use by the surrounding module or function.
export const sendBookingConfirmationEmail = async (booking) => {
  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings({ tenantId: booking?.tenantId });
  // Declare companyName for use by the surrounding module or function.
  const companyName = clean(settings.companyName, "Hussein Mboya Tours");
  // Declare bookingNumber for use by the surrounding module or function.
  const bookingNumber = clean(booking?.bookingNumber, "Pending");
  // Declare tour for use by the surrounding module or function.
  const tour = clean(booking?.tour?.title || booking?.tour?.name || booking?.tour, "Tour package");
  // Declare travelDate for use by the surrounding module or function.
  const travelDate = formatDate(booking?.travelDate);
  // Declare total for use by the surrounding module or function.
  const total = money(booking?.totalAmount ?? booking?.amount ?? 0);
  // Declare subject for use by the surrounding module or function.
  const subject = `Booking confirmation - ${companyName}`;
  // Declare text for use by the surrounding module or function.
  const text = `Booking confirmation\n\nThank you for choosing ${companyName}.\n\nBooking number: ${bookingNumber}\nTour: ${tour}\nTravel date: ${travelDate}\nTotal amount: ${total}\n\nRegards,\n${companyName}`;
  // Declare html for use by the surrounding module or function.
  const html = `<h2>Booking confirmation</h2><p>Thank you for choosing ${escapeHtml(companyName)}.</p><p><strong>Booking number:</strong> ${escapeHtml(bookingNumber)}<br><strong>Tour:</strong> ${escapeHtml(tour)}<br><strong>Travel date:</strong> ${escapeHtml(travelDate)}<br><strong>Total amount:</strong> ${escapeHtml(total)}</p>`;
  // Return the result of sendEmail() to the caller.
  return sendEmail({ to: bookingEmailAddress(booking), subject, html, text, fromName: companyName });
};

// Declare sendPaymentConfirmationEmail for use by the surrounding module or function.
export const sendPaymentConfirmationEmail = async (booking, payment) => {
  // Declare companyName for use by the surrounding module or function.
  const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");
  // Declare amount for use by the surrounding module or function.
  const amount = money(payment?.amount ?? 0);
  // Declare reference for use by the surrounding module or function.
  const reference = clean(payment?.mpesaReceiptNumber || payment?.transactionReference || payment?.transactionId, "Not provided");
  // Return the result of sendEmail() to the caller.
  return sendEmail({
    to: bookingEmailAddress(booking), subject: `Payment received - ${clean(booking?.bookingNumber, "Booking")}`,
    text: `We received your payment of ${amount} for booking ${clean(booking?.bookingNumber, "Pending")}. Reference: ${reference}.`,
    html: `<h2>Payment received</h2><p>We received <strong>${escapeHtml(amount)}</strong> for booking <strong>${escapeHtml(clean(booking?.bookingNumber, "Pending"))}</strong>.</p><p>Reference: ${escapeHtml(reference)}</p>`, fromName: companyName,
  });
};

// Declare sendBookingStatusEmail for use by the surrounding module or function.
export const sendBookingStatusEmail = async (booking, status, reason = "") => {
  // Declare companyName for use by the surrounding module or function.
  const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");
  // Declare bookingNumber for use by the surrounding module or function.
  const bookingNumber = clean(booking?.bookingNumber, "Pending");
  // Declare title for use by the surrounding module or function.
  const title = status === "cancelled" ? "Booking cancelled" : status === "refunded" ? "Booking refund update" : "Booking status update";
  // Declare message for use by the surrounding module or function.
  const message = `${title}: booking ${bookingNumber} is now ${status}.${reason ? ` ${reason}` : ""}`;
  // Return the result of sendEmail() to the caller.
  return sendEmail({ to: bookingEmailAddress(booking), subject: `${title} - ${companyName}`, text: message, html: `<h2>${escapeHtml(title)}</h2><p>Booking <strong>${escapeHtml(bookingNumber)}</strong> is now ${escapeHtml(status)}.</p>${reason ? `<p>${escapeHtml(reason)}</p>` : ""}`, fromName: companyName });
};

// Declare createEmailAttachment for use by the surrounding module or function.
export const createEmailAttachment = async ({ filename, path: filePath, contentType = "application/pdf" }) => {
  // Check the condition (!filename || !filePath) and run the matching branch.
  if (!filename || !filePath) throw new Error("Attachment filename and file path are required.");
  // Declare content for use by the surrounding module or function.
  const content = await fs.readFile(filePath);
  // Return the object assembled below to the caller.
  return { filename, content: content.toString("base64"), contentType };
};

// Used by focused tests without constructing a real SDK client.
// Declare resetResendClientForTests for use by the surrounding module or function.
export const resetResendClientForTests = () => { resendClient = undefined; resendClientApiKey = undefined; };
// Declare setResendClientForTests for use by the surrounding module or function.
export const setResendClientForTests = (client) => {
  // Perform the side effect or state update expressed on the following line.
  resendClient = client;
  // Perform the side effect or state update expressed on the following line.
  resendClientApiKey = String(process.env.RESEND_API_KEY || "").trim();
};

// Declare sendEmailBestEffort for use by the surrounding module or function.
export const sendEmailBestEffort = async (send, context = "Notification") => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of send() operation to the caller.
    return await send();
  } catch {
    // Perform the side effect or state update expressed on the following line.
    console.error(`${context} email failed.`);
    // Return the expression shown below to the caller.
    return null;
  }
};

export default null;
