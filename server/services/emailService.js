import { Resend } from "resend";
import { getSystemSettings } from "./settingsService.js";

export const RESEND_TEST_SENDER = "onboarding@resend.dev";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let resendClient;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const clean = (value, fallback = "Not specified") => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(text) ? text : fallback;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : "Not specified";
const money = (value) => `KES ${Number(value ?? 0).toLocaleString("en-KE")}`;

const clientFor = (apiKey) => {
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
};

export const sendEmail = async ({ to, subject, html, text, attachments = [], cc, bcc, replyTo, fromName, settingsSource }) => {
  if (!to) throw new Error("Recipient email is required.");
  if (!subject) throw new Error("Email subject is required.");
  if (!html && !text) throw new Error("Email content is required.");

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  const sender = String(process.env.RESEND_FROM_EMAIL || RESEND_TEST_SENDER).trim();
  if (!EMAIL_PATTERN.test(sender)) throw new Error("RESEND_FROM_EMAIL must be a valid email address.");

  const settings = await getSystemSettings(settingsSource);
  const companyName = clean(fromName || process.env.RESEND_FROM_NAME || settings.companyName, "Hussein Mboya Tours");
  const from = `${companyName.replace(/[<>\r\n]/g, "")} <${sender}>`;
  const { data, error } = await clientFor(apiKey).emails.send({ from, to, subject, html, text, attachments, cc, bcc, replyTo });
  if (error) {
    // Resend response errors are surfaced without including request headers or credentials.
    throw new Error("Resend email delivery failed.");
  }
  return data;
};

const bookingEmailAddress = (booking) => booking?.contact?.email || booking?.contactEmail || booking?.customerSnapshot?.email || booking?.customer?.email || booking?.user?.email;

export const sendBookingConfirmationEmail = async (booking) => {
  const settings = await getSystemSettings({ tenantId: booking?.tenantId });
  const companyName = clean(settings.companyName, "Hussein Mboya Tours");
  const bookingNumber = clean(booking?.bookingNumber, "Pending");
  const tour = clean(booking?.tour?.title || booking?.tour?.name || booking?.tour, "Tour package");
  const travelDate = formatDate(booking?.travelDate);
  const total = money(booking?.totalAmount ?? booking?.amount ?? 0);
  const subject = `Booking confirmation - ${companyName}`;
  const text = `Booking confirmation\n\nThank you for choosing ${companyName}.\n\nBooking number: ${bookingNumber}\nTour: ${tour}\nTravel date: ${travelDate}\nTotal amount: ${total}\n\nRegards,\n${companyName}`;
  const html = `<h2>Booking confirmation</h2><p>Thank you for choosing ${escapeHtml(companyName)}.</p><p><strong>Booking number:</strong> ${escapeHtml(bookingNumber)}<br><strong>Tour:</strong> ${escapeHtml(tour)}<br><strong>Travel date:</strong> ${escapeHtml(travelDate)}<br><strong>Total amount:</strong> ${escapeHtml(total)}</p>`;
  return sendEmail({ to: bookingEmailAddress(booking), subject, html, text, fromName: companyName });
};

export const sendPaymentConfirmationEmail = async (booking, payment) => {
  const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");
  const amount = money(payment?.amount ?? 0);
  const reference = clean(payment?.mpesaReceiptNumber || payment?.transactionReference || payment?.transactionId, "Not provided");
  return sendEmail({
    to: bookingEmailAddress(booking), subject: `Payment received - ${clean(booking?.bookingNumber, "Booking")}`,
    text: `We received your payment of ${amount} for booking ${clean(booking?.bookingNumber, "Pending")}. Reference: ${reference}.`,
    html: `<h2>Payment received</h2><p>We received <strong>${escapeHtml(amount)}</strong> for booking <strong>${escapeHtml(clean(booking?.bookingNumber, "Pending"))}</strong>.</p><p>Reference: ${escapeHtml(reference)}</p>`, fromName: companyName,
  });
};

export const sendBookingStatusEmail = async (booking, status, reason = "") => {
  const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");
  const bookingNumber = clean(booking?.bookingNumber, "Pending");
  const title = status === "cancelled" ? "Booking cancelled" : status === "refunded" ? "Booking refund update" : "Booking status update";
  const message = `${title}: booking ${bookingNumber} is now ${status}.${reason ? ` ${reason}` : ""}`;
  return sendEmail({ to: bookingEmailAddress(booking), subject: `${title} - ${companyName}`, text: message, html: `<h2>${escapeHtml(title)}</h2><p>Booking <strong>${escapeHtml(bookingNumber)}</strong> is now ${escapeHtml(status)}.</p>${reason ? `<p>${escapeHtml(reason)}</p>` : ""}`, fromName: companyName });
};

// Used by focused tests without constructing a real SDK client.
export const resetResendClientForTests = () => { resendClient = undefined; };
export const setResendClientForTests = (client) => { resendClient = client; };

export const sendEmailBestEffort = async (send, context = "Notification") => {
  try {
    return await send();
  } catch {
    console.error(`${context} email failed.`);
    return null;
  }
};

export default null;
