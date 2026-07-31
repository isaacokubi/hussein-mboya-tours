// services/emailService.js

import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| EMAIL TRANSPORT
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,

  port: Number(process.env.EMAIL_PORT),

  secure: process.env.EMAIL_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/*
|--------------------------------------------------------------------------
| VERIFY SMTP CONNECTION
|--------------------------------------------------------------------------
*/

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log("✅ Email server connected");
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GENERIC EMAIL SENDER
|--------------------------------------------------------------------------
*/

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
  cc,
  bcc,
  replyTo,
}) => {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!html && !text) {
    throw new Error("Email content is required.");
  }

  const mailOptions = {
    from: `"Hussein Mboya Tours" <${process.env.EMAIL_USER}>`,

    to,

    subject,

    html,

    text,

    attachments,

    cc,

    bcc,

    replyTo,
  };

  const info = await transporter.sendMail(mailOptions);

  return info;
};

/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION EMAIL
|--------------------------------------------------------------------------
*/

export const sendBookingEmail = async (email, booking) => {
  return sendEmail({
    to: email,

    subject: "Booking Confirmation - Hussein Mboya Tours",

    html: `
      <div style="font-family:Arial,sans-serif">

        <h2>Booking Confirmed</h2>

        <p>Thank you for choosing Hussein Mboya Tours.</p>

        <hr>

        <p><strong>Booking Number:</strong> ${
          booking.bookingNumber || "Pending"
        }</p>

        <p><strong>Tour:</strong> ${
          booking.tour?.title ||
          booking.tour?.name ||
          booking.tour
        }</p>

        <p><strong>Travel Date:</strong> ${
          booking.travelDate
        }</p>

        <p><strong>Total Amount:</strong> ${
          booking.totalAmount
        }</p>

        <br>

        <p>
          We look forward to giving you an unforgettable travel experience.
        </p>

        <p>
          Regards,<br>
          <strong>Hussein Mboya Tours</strong>
        </p>

      </div>
    `,

    text: `
Booking Confirmed

Booking Number: ${booking.bookingNumber || "Pending"}

Tour: ${booking.tour?.title || booking.tour?.name || booking.tour}

Travel Date: ${booking.travelDate}

Total Amount: ${booking.totalAmount}

Thank you for choosing Hussein Mboya Tours.
    `,
  });
};

export default transporter;