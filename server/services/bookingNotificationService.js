import fs from "fs/promises";
import { getSystemSettings } from "../services/settingsService.js";
import path from "path";

import { sendEmail } from "./emailService.js";
import { bookingConfirmationEmail } from "../utils/emailTemplates.js";
import { createInvoice } from "../utils/createInvoice.js";

/*
|--------------------------------------------------------------------------
| SEND BOOKING CONFIRMATION EMAIL
|--------------------------------------------------------------------------
*/

export const sendBookingConfirmation = async (booking) => {
  let invoicePath = "";

  try {
    if (!booking) {
      throw new Error("Booking is required.");
    }

    if (!booking.contactEmail) {
      throw new Error("Customer email is missing.");
    }

    // Ensure uploads directory exists
    const uploadDir = path.resolve("uploads");

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    invoicePath = path.join(
      uploadDir,
      `${booking.bookingNumber}.pdf`
    );

    /*
    |--------------------------------------------------------------------------
    | GENERATE PDF INVOICE
    |--------------------------------------------------------------------------
    */

    await createInvoice({
      booking,
      filePath: invoicePath,
    });

    /*
    |--------------------------------------------------------------------------
    | SEND EMAIL
    |--------------------------------------------------------------------------
    */

    const result = await sendEmail({
      to: booking.contactEmail,

      subject: `Your ${companyName} Booking Confirmation`,

      html: bookingConfirmationEmail({
        customerName: booking.contactName,

        bookingNumber: booking.bookingNumber,

        tourName: booking.tour?.title || "Tour",

        amount: booking.totalAmount,
      }),

      attachments: [
        {
          filename: `Invoice-${booking.bookingNumber}.pdf`,
          path: invoicePath,
        },
      ],
    });

    /*
    |--------------------------------------------------------------------------
    | CLEAN UP GENERATED PDF
    |--------------------------------------------------------------------------
    */

    await fs.unlink(invoicePath).catch(() => {});

    return result;
  } catch (error) {
    // Delete PDF if something failed
    if (invoicePath) {
      await fs.unlink(invoicePath).catch(() => {});
    }

    console.error(
      "Booking confirmation email failed:",
      error.message
    );

    throw error;
  }
};