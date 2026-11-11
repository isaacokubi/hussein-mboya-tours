/**
 * Purpose: booking Notification Service business-logic service. Main declarations: sendBookingConfirmation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import fs from "fs/promises";
// Load path so this module can use its exported dependencies.
import path from "path";
// Load ./emailService.js so this module can use its exported dependencies.
import { createEmailAttachment, sendEmail } from "./emailService.js";
// Load ../utils/emailTemplates.js so this module can use its exported dependencies.
import { bookingConfirmationEmail } from "../utils/emailTemplates.js";
// Load ../utils/createInvoice.js so this module can use its exported dependencies.
import { createInvoice } from "../utils/createInvoice.js";
// Load ./settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "./settingsService.js";

// Declare sendBookingConfirmation for use by the surrounding module or function.
export const sendBookingConfirmation = async (booking) => {
  // Declare invoicePath for use by the surrounding module or function.
  let invoicePath = "";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!booking) and run the matching branch.
    if (!booking) throw new Error("Booking is required.");
    // Declare contactEmail for use by the surrounding module or function.
    const contactEmail = booking.contactEmail || booking.contact?.email || booking.customerSnapshot?.email;
    // Check the condition (!contactEmail) and run the matching branch.
    if (!contactEmail) throw new Error("Customer email is missing.");
    // Declare settings for use by the surrounding module or function.
    const settings = await getSystemSettings({ tenantId: booking.tenantId });
    // Declare companyName for use by the surrounding module or function.
    const companyName = settings.companyName || "Global Tours";
    // Declare uploadDir for use by the surrounding module or function.
    const uploadDir = path.resolve("uploads");
    // Perform the side effect or state update expressed on the following line.
    await fs.mkdir(uploadDir, { recursive: true });
    // Perform the side effect or state update expressed on the following line.
    invoicePath = path.join(uploadDir, `${booking.bookingNumber}.pdf`);
    // Perform the side effect or state update expressed on the following line.
    await createInvoice({ booking, filePath: invoicePath });
    // Declare result for use by the surrounding module or function.
    const result = await sendEmail({
      to: contactEmail,
      subject: `Your ${companyName} Booking Confirmation`,
      html: bookingConfirmationEmail({ customerName: booking.contactName || booking.contact?.name || booking.customerSnapshot?.name || "Customer", bookingNumber: booking.bookingNumber, tourName: booking.tour?.title || "Tour", amount: booking.totalAmount }),
      attachments: [await createEmailAttachment({ filename: `Invoice-${booking.bookingNumber}.pdf`, path: invoicePath })],
    });
    // Perform the side effect or state update expressed on the following line.
    await fs.unlink(invoicePath).catch(() => {});
    // Return the value of result to the caller.
    return result;
  } catch (error) {
    // Check the condition (invoicePath) and run the matching branch.
    if (invoicePath) await fs.unlink(invoicePath).catch(() => {});
    // Perform the side effect or state update expressed on the following line.
    console.error("Booking confirmation email failed:", error.message);
    // Stop the current operation by raising the value of error.
    throw error;
  }
};
