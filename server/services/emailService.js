import { getSystemSettings } from "./settingsService.js";
import nodemailer from "nodemailer";

const smtpHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
const smtpPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const smtpPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD;
const smtpFrom = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || smtpUser;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const clean = (value, fallback = "Not specified") => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(text) ? text : fallback;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : "Not specified";
const money = (value) => `KES ${Number(value ?? 0).toLocaleString("en-KE")}`;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: process.env.EMAIL_SECURE === "true" || smtpPort === 465,
  auth: smtpUser ? { user: smtpUser, pass: smtpPassword } : undefined,
});

export const verifyEmailConnection = async () => {
  try {
    if (!smtpHost) return;
    await transporter.verify();
  } catch (error) {
    console.error("Email configuration error:", error.message);
  }
};

export const sendEmail = async ({ to, subject, html, text, attachments = [], cc, bcc, replyTo, fromName }) => {
  if (!to) throw new Error("Recipient email is required.");
  if (!subject) throw new Error("Email subject is required.");
  if (!html && !text) throw new Error("Email content is required.");
  if (!smtpHost) throw new Error("SMTP email host is not configured.");
  const settings = await getSystemSettings();
  const companyName = clean(fromName || settings.companyName, "Global Tours");
  return transporter.sendMail({
    from: `"${companyName}" <${smtpFrom}>`,
    to,
    subject,
    html,
    text,
    attachments,
    cc,
    bcc,
    replyTo,
  });
};

export const sendBookingEmail = async (email, booking) => {
  const settings = await getSystemSettings();
  const companyName = clean(settings.companyName, "Global Tours");
  const bookingNumber = clean(booking.bookingNumber, "Pending");
  const tour = clean(booking.tour?.title || booking.tour?.name || booking.tour, "Tour package");
  const travelDate = formatDate(booking.travelDate);
  const total = money(booking.totalAmount ?? booking.amount ?? 0);
  const subject = `Booking confirmation - ${companyName}`;
  const text = `Booking confirmation\n\nThank you for choosing ${companyName}.\n\nBooking number: ${bookingNumber}\nTour: ${tour}\nTravel date: ${travelDate}\nTotal amount: ${total}\n\nWe look forward to giving you an unforgettable travel experience.\n\nRegards,\n${companyName}`;
  const html = `<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 style="margin-top:0">Booking confirmation</h2><p>Thank you for choosing ${escapeHtml(companyName)}.</p><div style="padding:16px;background:#f8fafc;border-radius:10px"><p><strong>Booking number:</strong> ${escapeHtml(bookingNumber)}</p><p><strong>Tour:</strong> ${escapeHtml(tour)}</p><p><strong>Travel date:</strong> ${escapeHtml(travelDate)}</p><p><strong>Total amount:</strong> ${escapeHtml(total)}</p></div><p>We look forward to giving you an unforgettable travel experience.</p><p>Regards,<br>${escapeHtml(companyName)}</p></div>`;
  return sendEmail({ to: email, subject, html, text, fromName: companyName });
};

export default transporter;
