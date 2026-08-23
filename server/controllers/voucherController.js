import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
// controllers/voucherController.js

import mongoose from "mongoose";
import PDFDocument from "pdfkit";

import Booking from "../models/Booking.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| GENERATE BOOKING VOUCHER PDF
|--------------------------------------------------------------------------
| Features:
|
| - Authorization
| - Validation
| - Professional layout
| - Branding
| - Payment summary
| - Tour details
|
|--------------------------------------------------------------------------
*/

export const generateVoucher = async (req, res, next) => {
  requireTenantId();
  try {

    const settings = await getSystemSettings();

    const companyName =
      settings.companyName || "Company";

    const currency =
      settings.currency || "KES";


    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */

    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)

      .populate({
        path: "customer",
        select: "name email phone",
      })

      .populate({
        path: "user",
        select: "name email phone",
      })

      .populate({
        path: "tour",
        populate: {
          path: "destination",
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZATION
    |--------------------------------------------------------------------------
    */

    const allowedRoles = [
      "admin",
      "tour_manager",
      "finance",
      "customer",
    ];

    const userRole =
      req.user.role?.name ||
      req.user.role ||
      "";

    const isAdmin =
      allowedRoles.includes(userRole);

    const isOwner =
      booking.customer?.toString() ===
      req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PDF
    |--------------------------------------------------------------------------
    */

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    /*
    |--------------------------------------------------------------------------
    | HEADERS
    |--------------------------------------------------------------------------
    */

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=voucher-${booking.bookingNumber || booking._id}.pdf`
    );

    doc.pipe(res);

    /*
    |--------------------------------------------------------------------------
    | PDF META
    |--------------------------------------------------------------------------
    */

    doc.info.Title =
      "Tour Voucher";

    doc.info.Author =
      companyName;

    doc.info.Subject =
      "Travel Voucher";

    /*
    |--------------------------------------------------------------------------
    | COMPANY HEADER
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(
        "HUSSEIN MBOYA TOURS",
        {
          align: "center",
        }
      );

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Nairobi, Kenya",
        {
          align: "center",
        }
      );

    doc.text(
      "Phone: +254 XXX XXX XXX",
      {
        align: "center",
      }
    );

    doc.text(
      "Email: info@husseinmboyatours.com",
      {
        align: "center",
      }
    );

    doc.moveDown(2);

    /*
    |--------------------------------------------------------------------------
    | TITLE
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(
        "BOOKING VOUCHER",
        {
          align: "center",
        }
      );

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Generated: ${new Date().toLocaleDateString(
          "en-KE",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )}`,
        {
          align: "right",
        }
      );

    doc.moveDown(2);    /*
    |--------------------------------------------------------------------------
    | BOOKING INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Booking Information", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);

    doc.text(`Booking Number : ${bookingNumber}`);
    doc.text(`Booking ID     : ${booking._id}`);
    doc.text(`Status         : ${booking.status || booking.status || "Pending"}`);
    doc.text(`Payment Status : ${booking.paymentStatus || "Pending"}`);
    doc.text(`Travel Date    : ${travelDate}`);

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Customer Information", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);

    doc.text(
      `Customer : ${booking.customer?.name || booking.customer?.name || "N/A"}`
    );

    doc.text(
      `Email    : ${booking.customer?.email || booking.customer?.email || "N/A"}`
    );

    doc.text(
      `Phone    : ${booking.customer?.phone || "N/A"}`
    );

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | TOUR INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Tour Information", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);

    doc.text(
      `Tour : ${booking.tour?.title || "N/A"}`
    );

    doc.text(
      `Destination : ${
        booking.tour?.destination?.name || "N/A"
      }`
    );

    doc.text(
      `Country : ${
        booking.tour?.destination?.country || "N/A"
      }`
    );

    doc.text(`Guests : ${guests}`);

    if (booking.roomType) {
      doc.text(`Room Type : ${booking.roomType}`);
    }

    if (booking.specialRequests) {
      doc.text(
        `Special Requests : ${booking.specialRequests}`
      );
    }

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | GUIDE INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Assigned Guide", {
        underline: true,
      });

    doc.moveDown(0.5);

    if (booking.tour?.assignedGuide) {
      doc.fontSize(11);

      doc.text(
        `Guide : ${booking.tour.assignedGuide.name}`
      );

      doc.text(
        `Phone : ${
          booking.tour.assignedGuide.phone || "N/A"
        }`
      );
    } else {
      doc
        .fontSize(11)
        .text("Guide has not been assigned yet.");
    }

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | DRIVER INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Assigned Driver", {
        underline: true,
      });

    doc.moveDown(0.5);

    if (booking.tour?.assignedDriver) {
      doc.fontSize(11);

      doc.text(
        `Driver : ${booking.tour.assignedDriver.name}`
      );

      doc.text(
        `Phone : ${
          booking.tour.assignedDriver.phone || "N/A"
        }`
      );
    } else {
      doc
        .fontSize(11)
        .text("Driver has not been assigned yet.");
    }

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | VEHICLE INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Assigned Vehicle", {
        underline: true,
      });

    doc.moveDown(0.5);

    if (booking.tour?.assignedVehicle) {
      doc.fontSize(11);

      doc.text(
        `Vehicle : ${
          booking.tour.assignedVehicle.name
        }`
      );

      doc.text(
        `Registration : ${
          booking.tour.assignedVehicle.registrationNumber ||
          "N/A"
        }`
      );

      doc.text(
        `Type : ${
          booking.tour.assignedVehicle.type ||
          "N/A"
        }`
      );
    } else {
      doc
        .fontSize(11)
        .text("Vehicle has not been assigned yet.");
    }

    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | PAYMENT SUMMARY
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Payment Summary", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);

    doc.text(`Amount Paid : KES ${amount.toLocaleString()}`);

    doc.text(
      `Payment Status : ${
        booking.paymentStatus || "Pending"
      }`
    );

    if (booking.transactionId) {
      doc.text(
        `Transaction ID : ${booking.transactionId}`
      );
    }

    if (booking.mpesaReceipt) {
      doc.text(
        `M-Pesa Receipt : ${booking.mpesaReceipt}`
      );
    }

    if (booking.paidAt) {
      doc.text(
        `Paid On : ${new Date(
          booking.paidAt
        ).toLocaleString("en-KE")}`
      );
    }

    doc.moveDown(2);    /*
    |--------------------------------------------------------------------------
    | IMPORTANT INFORMATION
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Important Information", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(10);

    doc.text(
      "• Please arrive at the designated pickup point at least 30 minutes before departure."
    );

    doc.text(
      "• Carry a valid identification document during the trip."
    );

    doc.text(
      "• Present this voucher (printed or digital) before boarding."
    );

    doc.text(
      "• The company reserves the right to adjust schedules due to weather or safety considerations."
    );

    doc.text(
      "• Contact our office immediately if you need to amend or cancel your booking."
    );

    doc.moveDown(2);

    /*
    |--------------------------------------------------------------------------
    | COMPANY CONTACT
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(14)
      .text("Contact Information", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(10);

    doc.text(companyName);
    doc.text("Nairobi, Kenya");
    doc.text("Phone: +254 XXX XXX XXX");
    doc.text("Email: info@husseinmboyatours.com");
    doc.text("Website: www.husseinmboyatours.com");

    doc.moveDown(3);

    /*
    |--------------------------------------------------------------------------
    | SIGNATURE SECTION
    |--------------------------------------------------------------------------
    */

    const signatureY = doc.y;

    doc.text(
      "__________________________",
      70,
      signatureY
    );

    doc.text(
      "Authorized Signature",
      70,
      signatureY + 18
    );

    doc.text(
      "__________________________",
      330,
      signatureY
    );

    doc.text(
      "Customer Signature",
      330,
      signatureY + 18
    );

    doc.moveDown(5);

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    doc.fontSize(9);

    doc.text(
      `Thank you for choosing ${companyName}.`,
      {
        align: "center",
      }
    );

    doc.text(
      "We wish you a safe and memorable journey!",
      {
        align: "center",
      }
    );

    doc.moveDown();

    doc.fillColor("gray");

    doc.text(
      `Voucher Generated: ${new Date().toLocaleString("en-KE")}`,
      {
        align: "center",
      }
    );

    doc.text(
      `Booking Reference: ${bookingNumber}`,
      {
        align: "center",
      }
    );

    doc.fillColor("black");

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL QR CODE PLACEHOLDER
    |--------------------------------------------------------------------------
    |
    | If you install:
    |
    | npm install qrcode
    |
    | You can generate a QR code that points to:
    |
    | https://yourdomain.com/booking/verify/${booking._id}
    |
    | Example:
    |
    | import QRCode from "qrcode";
    |
    | const qr = await QRCode.toDataURL(
    |   `https://yourdomain.com/booking/verify/${booking._id}`
    | );
    |
    | doc.image(Buffer.from(qr.split(",")[1], "base64"), 450, 40, {
    |   width: 100,
    | });
    |
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | FINISH PDF
    |--------------------------------------------------------------------------
    */

    doc.end();
  } catch (error) {
    console.error("Generate Voucher Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate booking voucher.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }

    next(error);
  }
};
