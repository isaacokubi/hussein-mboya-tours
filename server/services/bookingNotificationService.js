import fs from "fs/promises";
import path from "path";
import { sendEmail } from "./emailService.js";
import { bookingConfirmationEmail } from "../utils/emailTemplates.js";
import { createInvoice } from "../utils/createInvoice.js";
import { getSystemSettings } from "./settingsService.js";

export const sendBookingConfirmation = async (booking) => {
  let invoicePath = "";
  try {
    if (!booking) throw new Error("Booking is required.");
    const contactEmail = booking.contactEmail || booking.contact?.email || booking.customerSnapshot?.email;
    if (!contactEmail) throw new Error("Customer email is missing.");
    const settings = await getSystemSettings({ tenantId: booking.tenantId });
    const companyName = settings.companyName || "Global Tours";
    const uploadDir = path.resolve("uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    invoicePath = path.join(uploadDir, `${booking.bookingNumber}.pdf`);
    await createInvoice({ booking, filePath: invoicePath });
    const result = await sendEmail({
      to: contactEmail,
      subject: `Your ${companyName} Booking Confirmation`,
      html: bookingConfirmationEmail({ customerName: booking.contactName || booking.contact?.name || booking.customerSnapshot?.name || "Customer", bookingNumber: booking.bookingNumber, tourName: booking.tour?.title || "Tour", amount: booking.totalAmount }),
      attachments: [{ filename: `Invoice-${booking.bookingNumber}.pdf`, path: invoicePath }],
    });
    await fs.unlink(invoicePath).catch(() => {});
    return result;
  } catch (error) {
    if (invoicePath) await fs.unlink(invoicePath).catch(() => {});
    console.error("Booking confirmation email failed:", error.message);
    throw error;
  }
};
