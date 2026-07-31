import PDFDocument from "pdfkit";

/*
|--------------------------------------------------------------------------
| GENERATE PAYMENT RECEIPT
|--------------------------------------------------------------------------
*/

export const generateReceipt = (booking, res) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${booking.bookingNumber}.pdf`
  );

  doc.pipe(res);

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  doc
    .fontSize(24)
    .text("Hussein Mboya Tours", {
      align: "center",
    });

  doc
    .fontSize(12)
    .text("Official Payment Receipt", {
      align: "center",
    });

  doc.moveDown(2);

  /*
  |--------------------------------------------------------------------------
  | RECEIPT DETAILS
  |--------------------------------------------------------------------------
  */

  doc.fontSize(14);

  doc.text(`Receipt No: ${booking.bookingNumber}`);

  doc.text(
    `Date: ${
      booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString()
    }`
  );

  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER
  |--------------------------------------------------------------------------
  */

  doc.fontSize(16).text("Customer");

  doc.fontSize(12);

  doc.text(
    `Name: ${
      booking.contactName ||
      booking.fullName ||
      "N/A"
    }`
  );

  doc.text(
    `Email: ${
      booking.contactEmail || "N/A"
    }`
  );

  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | BOOKING
  |--------------------------------------------------------------------------
  */

  doc.fontSize(16).text("Booking");

  doc.fontSize(12);

  doc.text(
    `Booking Number: ${
      booking.bookingNumber
    }`
  );

  doc.text(
    `Tour: ${
      booking.tour?.title ||
      booking.tour?.name ||
      "N/A"
    }`
  );

  doc.text(
    `Travel Date: ${
      booking.travelDate || "N/A"
    }`
  );

  doc.text(
    `Travelers: ${
      booking.travelerCount || 1
    }`
  );

  doc.moveDown();

  /*
  |--------------------------------------------------------------------------
  | PAYMENT
  |--------------------------------------------------------------------------
  */

  doc.fontSize(16).text("Payment");

  doc.fontSize(12);

  doc.text(
    `Amount: ${
      booking.currency || "KES"
    } ${booking.totalAmount ?? booking.amount}`
  );

  doc.text(
    `Payment Status: ${
      booking.paymentStatus
    }`
  );

  doc.text(
    `Payment Method: ${
      booking.paymentMethod || "N/A"
    }`
  );

  if (booking.mpesaReceiptNumber) {
    doc.text(
      `M-Pesa Receipt: ${booking.mpesaReceiptNumber}`
    );
  }

  doc.moveDown(2);

  /*
  |--------------------------------------------------------------------------
  | FOOTER
  |--------------------------------------------------------------------------
  */

  doc
    .fontSize(10)
    .text(
      "Thank you for choosing Hussein Mboya Tours.",
      {
        align: "center",
      }
    );

  doc.text(
    "This receipt serves as proof of payment.",
    {
      align: "center",
    }
  );

  doc.end();
};