import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING INVOICE
|--------------------------------------------------------------------------
*/

export const createInvoice = async ({
  booking,
  filePath,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const directory = path.dirname(filePath);

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {
          recursive: true,
        });
      }

      const doc = new PDFDocument({
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

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
        .fontSize(16)
        .text("BOOKING INVOICE", {
          align: "center",
        });

      doc.moveDown(2);

      /*
      |--------------------------------------------------------------------------
      | INVOICE DETAILS
      |--------------------------------------------------------------------------
      */

      doc.fontSize(12);

      doc.text(
        `Invoice #: ${booking.bookingNumber}`
      );

      doc.text(
        `Issue Date: ${new Date().toLocaleDateString()}`
      );

      doc.moveDown();

      /*
      |--------------------------------------------------------------------------
      | CUSTOMER DETAILS
      |--------------------------------------------------------------------------
      */

      doc.font("Helvetica-Bold");

      doc.text("Customer");

      doc.font("Helvetica");

      doc.text(
        booking.contactName || "N/A"
      );

      doc.text(
        booking.contactEmail || ""
      );

      doc.text(
        booking.contactPhone || ""
      );

      doc.moveDown();

      /*
      |--------------------------------------------------------------------------
      | TOUR DETAILS
      |--------------------------------------------------------------------------
      */

      doc.font("Helvetica-Bold");

      doc.text("Tour Information");

      doc.font("Helvetica");

      doc.text(
        `Tour: ${booking.tour?.title || "N/A"}`
      );

      doc.text(
        `Travel Date: ${
          booking.travelDate
            ? new Date(
                booking.travelDate
              ).toLocaleDateString()
            : "N/A"
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

      doc.font("Helvetica-Bold");

      doc.text("Payment Summary");

      doc.font("Helvetica");

      doc.text(
        `Subtotal: KES ${Number(
          booking.totalAmount || 0
        ).toLocaleString()}`
      );

      doc.text("Discount: KES 0");

      doc.text("Tax: KES 0");

      doc.moveDown();

      doc.font("Helvetica-Bold");

      doc.text(
        `TOTAL PAID: KES ${Number(
          booking.totalAmount || 0
        ).toLocaleString()}`
      );

      doc.moveDown(2);

      /*
      |--------------------------------------------------------------------------
      | FOOTER
      |--------------------------------------------------------------------------
      */

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(
          "Thank you for choosing Hussein Mboya Tours.",
          {
            align: "center",
          }
        );

      doc.text(
        "This invoice serves as proof of payment.",
        {
          align: "center",
        }
      );

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};