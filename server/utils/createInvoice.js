import PDFDocument from "pdfkit";
import { getSystemSettings } from "../services/settingsService.js";
import fs from "fs";
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

export const createInvoice = async ({ booking, filePath }) => {
  const settings = await getSystemSettings({ tenantId: booking?.tenantId });
  const companyName = settings.companyName || "Company";
  const currency = settings.currency || "KES";
  const currencySymbol = settings.currencySymbol || "KSh";
  const totalAmount = Number(booking?.totalAmount || 0);
  const paidAmount = Number(booking?.depositAmount || 0);
  const balanceAmount = Math.max(0, Number(booking?.balanceAmount ?? totalAmount - paidAmount));

  return new Promise((resolve, reject) => {
    try {
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(24).text(companyName, { align: "center" });
      doc.fontSize(16).text("BOOKING INVOICE", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(12);
      doc.text(`Invoice #: ${booking?.bookingNumber || booking?._id || "N/A"}`);
      doc.text(`Issue Date: ${new Date().toLocaleDateString("en-KE")}`);
      doc.moveDown();

      doc.font("Helvetica-Bold").text("Customer");
      doc.font("Helvetica");
      doc.text(booking?.contactName || booking?.customerSnapshot?.name || "N/A");
      doc.text(booking?.contactEmail || booking?.customerSnapshot?.email || "");
      doc.text(booking?.contactPhone || booking?.customerSnapshot?.phone || "");
      doc.moveDown();

      doc.font("Helvetica-Bold").text("Tour Information");
      doc.font("Helvetica");
      doc.text(`Tour: ${booking?.tour?.title || "N/A"}`);
      doc.text(`Travel Date: ${booking?.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "N/A"}`);
      doc.text(`Travelers: ${booking?.travelerCount || 1}`);
      doc.moveDown();

      doc.font("Helvetica-Bold").text("Payment Summary");
      doc.font("Helvetica");
      doc.text(`Total: ${currencySymbol} ${totalAmount.toLocaleString()} ${currency}`);
      doc.text(`Amount Paid: ${currencySymbol} ${paidAmount.toLocaleString()} ${currency}`);
      doc.text(`Balance Due: ${currencySymbol} ${balanceAmount.toLocaleString()} ${currency}`);
      doc.moveDown();

      const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();
      const statusLabel = paymentStatus === "paid" ? "PAID" : paymentStatus === "partial" ? "PARTIALLY PAID" : paymentStatus.toUpperCase();
      doc.font("Helvetica-Bold").text(`Payment Status: ${statusLabel}`);
      doc.moveDown(2);

      doc.fontSize(10).fillColor("gray").text(`Thank you for choosing ${companyName}.`, { align: "center" });
      doc.text("This document reflects the booking payment state recorded by the system.", { align: "center" });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};
