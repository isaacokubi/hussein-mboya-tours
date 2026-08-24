import { getSystemSettings } from "./settingsService.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
  } catch (error) {
    console.error("Email configuration error:", error.message);
  }
};

export const sendEmail = async ({ to, subject, html, text, attachments = [], cc, bcc, replyTo, fromName }) => {
  if (!to) throw new Error("Recipient email is required.");
  if (!subject) throw new Error("Email subject is required.");
  if (!html && !text) throw new Error("Email content is required.");
  const settings = await getSystemSettings();
  const companyName = fromName || settings.companyName || "Coherent Tours";
  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
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
  const companyName = settings.companyName || "Coherent Tours";
  return sendEmail({
    to: email,
    subject: `Booking Confirmation - ${companyName}`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Booking Confirmed</h2><p>Thank you for choosing ${companyName}.</p><p><strong>Booking Number:</strong> ${booking.bookingNumber || "Pending"}</p><p><strong>Tour:</strong> ${booking.tour?.title || booking.tour?.name || booking.tour || "Tour"}</p><p><strong>Travel Date:</strong> ${booking.travelDate || "Not specified"}</p><p><strong>Total Amount:</strong> ${booking.totalAmount ?? booking.amount ?? 0}</p><p>We look forward to giving you an unforgettable travel experience.</p><p>Regards,<br><strong>${companyName}</strong></p></div>`,
    text: `Booking Confirmed\n\nBooking Number: ${booking.bookingNumber || "Pending"}\nTour: ${booking.tour?.title || booking.tour?.name || booking.tour || "Tour"}\nTravel Date: ${booking.travelDate || "Not specified"}\nTotal Amount: ${booking.totalAmount ?? booking.amount ?? 0}\n\nThank you for choosing ${companyName}.`,
  });
};

export default transporter;
