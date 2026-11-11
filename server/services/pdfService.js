/**
 * Purpose: pdf Service business-logic service. Main declarations: generateReceipt.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load pdfkit so this module can use its exported dependencies.
import PDFDocument from "pdfkit";

/*
|--------------------------------------------------------------------------
| GENERATE PAYMENT RECEIPT
|--------------------------------------------------------------------------
*/

// Declare generateReceipt for use by the surrounding module or function.
export const generateReceipt = async (booking, res) => {

  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings();

  // Declare companyName for use by the surrounding module or function.
  const companyName =
    settings.companyName || "Company";

  // Declare currency for use by the surrounding module or function.
  const currency =
    settings.currencySymbol || "KSh";

  // Declare doc for use by the surrounding module or function.
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  // Perform the side effect or state update expressed on the following line.
  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  // Perform the side effect or state update expressed on the following line.
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${booking.bookingNumber}.pdf`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.pipe(res);

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc
    .fontSize(24)
    .text(companyName, {
      align: "center",
    });

  // Perform the side effect or state update expressed on the following line.
  doc
    .fontSize(12)
    .text("Official Payment Receipt", {
      align: "center",
    });

  // Perform the side effect or state update expressed on the following line.
  doc.moveDown(2);

  /*
  |--------------------------------------------------------------------------
  | RECEIPT DETAILS
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(14);

  // Perform the side effect or state update expressed on the following line.
  doc.text(`Receipt No: ${booking.bookingNumber}`);

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Date: ${
      booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString()
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(16).text("Customer");

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(12);

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Name: ${
      booking.contactName ||
      booking.fullName ||
      "N/A"
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Email: ${
      booking.contactEmail || "N/A"
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | BOOKING
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(16).text("Booking");

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(12);

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Booking Number: ${
      booking.bookingNumber
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Tour: ${
      booking.tour?.title ||
      booking.tour?.name ||
      "N/A"
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Travel Date: ${
      booking.travelDate || "N/A"
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Travelers: ${
      booking.travelerCount || 1
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | PAYMENT
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(16).text("Payment");

  // Perform the side effect or state update expressed on the following line.
  doc.fontSize(12);

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Amount: ${
      booking.currency || currency
    } ${booking.totalAmount ?? booking.amount}`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Payment Status: ${
      booking.paymentStatus
    }`
  );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    `Payment Method: ${
      booking.paymentMethod || "N/A"
    }`
  );

  // Check the condition (booking.mpesaReceiptNumber) and run the matching branch.
  if (booking.mpesaReceiptNumber) {
    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `M-Pesa Receipt: ${booking.mpesaReceiptNumber}`
    );
  }

  // Perform the side effect or state update expressed on the following line.
  doc.moveDown(2);

  /*
  |--------------------------------------------------------------------------
  | FOOTER
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  doc
    .fontSize(10)
    .text(
      "Thank you for choosing ${companyName}.",
      {
        align: "center",
      }
    );

  // Perform the side effect or state update expressed on the following line.
  doc.text(
    "This receipt serves as proof of payment.",
    {
      align: "center",
    }
  );

  // Perform the side effect or state update expressed on the following line.
  doc.end();
};
