/**
 * Purpose: create Invoice server application module. Main declarations: createInvoice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import PDFDocument from "pdfkit";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load fs so this module can use its exported dependencies.
import fs from "fs";
// Load path so this module can use its exported dependencies.
import path from "path";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING INVOICE PDF
|--------------------------------------------------------------------------
| This utility renders a booking invoice PDF. Financial values are read
| from the booking supplied by the server; it does not mark an invoice as
| paid or change eTIMS state.
|--------------------------------------------------------------------------
*/

// Declare createInvoice for use by the surrounding module or function.
export const createInvoice = async ({ booking, filePath }) => {
  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings({ tenantId: booking?.tenantId });
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || "Company";
  // Declare currency for use by the surrounding module or function.
  const currency = settings.currency || "KES";
  // Declare currencySymbol for use by the surrounding module or function.
  const currencySymbol = settings.currencySymbol || "KSh";
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = Number(booking?.totalAmount || 0);
  // Declare paidAmount for use by the surrounding module or function.
  const paidAmount = Number(booking?.depositAmount || 0);
  // Declare balanceAmount for use by the surrounding module or function.
  const balanceAmount = Math.max(0, Number(booking?.balanceAmount ?? totalAmount - paidAmount));

  // Return a new Promise instance to the caller.
  return new Promise((resolve, reject) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare directory for use by the surrounding module or function.
      const directory = path.dirname(filePath);
      // Check the condition (!fs.existsSync(directory)) and run the matching branch.
      if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

      // Declare doc for use by the surrounding module or function.
      const doc = new PDFDocument({ margin: 50 });
      // Declare stream for use by the surrounding module or function.
      const stream = fs.createWriteStream(filePath);
      // Perform the side effect or state update expressed on the following line.
      doc.pipe(stream);

      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(24).text(companyName, { align: "center" });
      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(16).text("BOOKING INVOICE", { align: "center" });
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown(2);

      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(12);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Invoice #: ${booking?.bookingNumber || booking?._id || "N/A"}`);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Issue Date: ${new Date().toLocaleDateString("en-KE")}`);
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown();

      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica-Bold").text("Customer");
      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica");
      // Perform the side effect or state update expressed on the following line.
      doc.text(booking?.contactName || booking?.customerSnapshot?.name || "N/A");
      // Perform the side effect or state update expressed on the following line.
      doc.text(booking?.contactEmail || booking?.customerSnapshot?.email || "");
      // Perform the side effect or state update expressed on the following line.
      doc.text(booking?.contactPhone || booking?.customerSnapshot?.phone || "");
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown();

      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica-Bold").text("Tour Information");
      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica");
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Tour: ${booking?.tour?.title || "N/A"}`);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Travel Date: ${booking?.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "N/A"}`);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Travelers: ${booking?.travelerCount || 1}`);
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown();

      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica-Bold").text("Payment Summary");
      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica");
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Total: ${currencySymbol} ${totalAmount.toLocaleString()} ${currency}`);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Amount Paid: ${currencySymbol} ${paidAmount.toLocaleString()} ${currency}`);
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Balance Due: ${currencySymbol} ${balanceAmount.toLocaleString()} ${currency}`);
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown();

      // Declare paymentStatus for use by the surrounding module or function.
      const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();
      // Declare statusLabel for use by the surrounding module or function.
      const statusLabel = paymentStatus === "paid" ? "PAID" : paymentStatus === "partial" ? "PARTIALLY PAID" : paymentStatus.toUpperCase();
      // Perform the side effect or state update expressed on the following line.
      doc.font("Helvetica-Bold").text(`Payment Status: ${statusLabel}`);
      // Perform the side effect or state update expressed on the following line.
      doc.moveDown(2);

      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(10).fillColor("gray").text(`Thank you for choosing ${companyName}.`, { align: "center" });
      // Perform the side effect or state update expressed on the following line.
      doc.text("This document reflects the booking payment state recorded by the system.", { align: "center" });

      // Perform the side effect or state update expressed on the following line.
      doc.end();

      // Perform the side effect or state update expressed on the following line.
      stream.on("finish", () => resolve(filePath));
      // Perform the side effect or state update expressed on the following line.
      stream.on("error", reject);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      reject(error);
    }
  });
};
