/**
 * Purpose: voucher Controller HTTP controller. Main declarations: generateVoucher.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// controllers/voucherController.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load pdfkit so this module can use its exported dependencies.
import PDFDocument from "pdfkit";

// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

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

// Declare generateVoucher for use by the surrounding module or function.
export const generateVoucher = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare settings for use by the surrounding module or function.
    const settings = await getSystemSettings();

    // Declare companyName for use by the surrounding module or function.
    const companyName =
      settings.companyName || "Company";

    // Declare currency for use by the surrounding module or function.
    const currency =
      settings.currency || "KES";


    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare booking for use by the surrounding module or function.
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
      })
      .populate({ path: "assignedGuide", select: "name phone" })
      .populate({ path: "assignedDriver", select: "name phone" })
      .populate({ path: "assignedVehicle", select: "name registrationNumber type" });

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare bookingNumber for use by the surrounding module or function.
    const bookingNumber = booking.bookingNumber || String(booking._id);
    // Declare travelDate for use by the surrounding module or function.
    const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "Not specified";
    // Declare guests for use by the surrounding module or function.
    const guests = Number(booking.numberOfGuests || booking.travelers?.length || 1);
    // Declare amount for use by the surrounding module or function.
    const amount = Number(booking.amountPaid || 0);

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZATION
    |--------------------------------------------------------------------------
    */

    // Declare allowedRoles for use by the surrounding module or function.
    const allowedRoles = new Set([
      "admin", "tour_manager", "finance", "manager", "super_admin", "superadmin",
    ]);

    // Declare userRole for use by the surrounding module or function.
    const userRole = String(req.user?.role?.name || req.user?.role || "").trim().toLowerCase();
    // Declare isAdmin for use by the surrounding module or function.
    const isAdmin = allowedRoles.has(userRole);
    // Declare bookingUserId for use by the surrounding module or function.
    const bookingUserId = booking.user?._id || booking.user;
    // Declare isOwner for use by the surrounding module or function.
    const isOwner = bookingUserId && String(bookingUserId) === String(req.user?._id);

    // Check the condition (!isAdmin && !isOwner) and run the matching branch.
    if (!isAdmin && !isOwner) {
      // Return the result of res.status(403).json() to the caller.
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

    // Declare doc for use by the surrounding module or function.
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    /*
    |--------------------------------------------------------------------------
    | HEADERS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    // Perform the side effect or state update expressed on the following line.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=voucher-${booking.bookingNumber || booking._id}.pdf`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.pipe(res);

    /*
    |--------------------------------------------------------------------------
    | PDF META
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc.info.Title =
      "Tour Voucher";

    // Perform the side effect or state update expressed on the following line.
    doc.info.Author =
      companyName;

    // Perform the side effect or state update expressed on the following line.
    doc.info.Subject =
      "Travel Voucher";

    /*
    |--------------------------------------------------------------------------
    | COMPANY HEADER
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(
        "GLOBAL TOURS",
        {
          align: "center",
        }
      );

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        [settings.address, settings.city, settings.country].filter(Boolean).join(", "),
        {
          align: "center",
        }
      );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      settings.supportPhone ? `Phone: ${settings.supportPhone}` : "",
      {
        align: "center",
      }
    );

    // Check the condition (settings.supportEmail) and run the matching branch.
    if (settings.supportEmail) doc.text(`Email: ${settings.supportEmail}`,
    { align: "center" });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(2);

    /*
    |--------------------------------------------------------------------------
    | TITLE
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(
        "BOOKING VOUCHER",
        {
          align: "center",
        }
      );

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(2);    /*
    |--------------------------------------------------------------------------
    | BOOKING INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Booking Information", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(11);

    // Perform the side effect or state update expressed on the following line.
    doc.text(`Booking Number : ${booking.bookingNumber || booking._id}`);
    // Perform the side effect or state update expressed on the following line.
    doc.text(`Booking ID     : ${booking._id}`);
    // Perform the side effect or state update expressed on the following line.
    doc.text(`Status         : ${booking.status || booking.status || "Pending"}`);
    // Perform the side effect or state update expressed on the following line.
    doc.text(`Payment Status : ${booking.paymentStatus || "Pending"}`);
    // Perform the side effect or state update expressed on the following line.
    doc.text(`Travel Date    : ${booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "Not specified"}`);

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Customer Information", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(11);

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Customer : ${booking.customer?.name || booking.customer?.name || "N/A"}`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Email    : ${booking.customer?.email || booking.customer?.email || "N/A"}`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Phone    : ${booking.customer?.phone || "N/A"}`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | TOUR INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Tour Information", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(11);

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Tour : ${booking.tour?.title || "N/A"}`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Destination : ${
        booking.tour?.destination?.name || "N/A"
      }`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Country : ${
        booking.tour?.destination?.country || "N/A"
      }`
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(`Guests : ${Number(booking.numberOfGuests || booking.travelers?.length || 1)}`);

    // Check the condition (booking.roomType) and run the matching branch.
    if (booking.roomType) {
      // Perform the side effect or state update expressed on the following line.
      doc.text(`Room Type : ${booking.roomType}`);
    }

    // Check the condition (booking.specialRequests) and run the matching branch.
    if (booking.specialRequests) {
      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Special Requests : ${booking.specialRequests}`
      );
    }

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | GUIDE INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Assigned Guide", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Check the condition (booking.tour?.assignedGuide) and run the matching branch.
    if (booking.tour?.assignedGuide) {
      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(11);

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Guide : ${booking.tour.assignedGuide.name}`
      );

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Phone : ${
          booking.tour.assignedGuide.phone || "N/A"
        }`
      );
    } else {
      // Perform the side effect or state update expressed on the following line.
      doc
        .fontSize(11)
        .text("Guide has not been assigned yet.");
    }

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | DRIVER INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Assigned Driver", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Check the condition (booking.tour?.assignedDriver) and run the matching branch.
    if (booking.tour?.assignedDriver) {
      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(11);

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Driver : ${booking.tour.assignedDriver.name}`
      );

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Phone : ${
          booking.tour.assignedDriver.phone || "N/A"
        }`
      );
    } else {
      // Perform the side effect or state update expressed on the following line.
      doc
        .fontSize(11)
        .text("Driver has not been assigned yet.");
    }

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | VEHICLE INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Assigned Vehicle", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Check the condition (booking.tour?.assignedVehicle) and run the matching branch.
    if (booking.tour?.assignedVehicle) {
      // Perform the side effect or state update expressed on the following line.
      doc.fontSize(11);

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Vehicle : ${
          booking.tour.assignedVehicle.name
        }`
      );

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Registration : ${
          booking.tour.assignedVehicle.registrationNumber ||
          "N/A"
        }`
      );

      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Type : ${
          booking.tour.assignedVehicle.type ||
          "N/A"
        }`
      );
    } else {
      // Perform the side effect or state update expressed on the following line.
      doc
        .fontSize(11)
        .text("Vehicle has not been assigned yet.");
    }

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    /*
    |--------------------------------------------------------------------------
    | PAYMENT SUMMARY
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Payment Summary", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(11);

    // Perform the side effect or state update expressed on the following line.
    doc.text(`Amount Paid : ${currency} ${Number(booking.amountPaid || 0).toLocaleString("en-KE")}`);

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Payment Status : ${
        booking.paymentStatus || "Pending"
      }`
    );

    // Check the condition (booking.transactionId) and run the matching branch.
    if (booking.transactionId) {
      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Transaction ID : ${booking.transactionId}`
      );
    }

    // Check the condition (booking.mpesaReceipt) and run the matching branch.
    if (booking.mpesaReceipt) {
      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `M-Pesa Receipt : ${booking.mpesaReceipt}`
      );
    }

    // Check the condition (booking.paidAt) and run the matching branch.
    if (booking.paidAt) {
      // Perform the side effect or state update expressed on the following line.
      doc.text(
        `Paid On : ${new Date(
          booking.paidAt
        ).toLocaleString("en-KE")}`
      );
    }

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(2);    /*
    |--------------------------------------------------------------------------
    | IMPORTANT INFORMATION
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Important Information", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(10);

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "• Please arrive at the designated pickup point at least 30 minutes before departure."
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "• Carry a valid identification document during the trip."
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "• Present this voucher (printed or digital) before boarding."
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "• The company reserves the right to adjust schedules due to weather or safety considerations."
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "• Contact our office immediately if you need to amend or cancel your booking."
    );

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(2);

    /*
    |--------------------------------------------------------------------------
    | COMPANY CONTACT
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc
      .fontSize(14)
      .text("Contact Information", {
        underline: true,
      });

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(0.5);

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(10);

    // Perform the side effect or state update expressed on the following line.
    doc.text(companyName);
    // Perform the side effect or state update expressed on the following line.
    doc.text("Nairobi, Kenya");
    // Perform the side effect or state update expressed on the following line.
    doc.text("Phone: +254 XXX XXX XXX");
    // Check the condition (settings.supportEmail) and run the matching branch.
    if (settings.supportEmail) doc.text(`Email: ${settings.supportEmail}`);
    // Check the condition (settings.websiteUrl) and run the matching branch.
    if (settings.websiteUrl) doc.text(`Website: ${settings.websiteUrl}`);

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(3);

    /*
    |--------------------------------------------------------------------------
    | SIGNATURE SECTION
    |--------------------------------------------------------------------------
    */

    // Declare signatureY for use by the surrounding module or function.
    const signatureY = doc.y;

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "__________________________",
      70,
      signatureY
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "Authorized Signature",
      70,
      signatureY + 18
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "__________________________",
      330,
      signatureY
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "Customer Signature",
      330,
      signatureY + 18
    );

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown(5);

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    doc.fontSize(9);

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Thank you for choosing ${companyName}.`,
      {
        align: "center",
      }
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      "We wish you a safe and memorable journey!",
      {
        align: "center",
      }
    );

    // Perform the side effect or state update expressed on the following line.
    doc.moveDown();

    // Perform the side effect or state update expressed on the following line.
    doc.fillColor("gray");

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Voucher Generated: ${new Date().toLocaleString("en-KE")}`,
      {
        align: "center",
      }
    );

    // Perform the side effect or state update expressed on the following line.
    doc.text(
      `Booking Reference: ${booking.bookingNumber || booking._id}`,
      {
        align: "center",
      }
    );

    // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    doc.end();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Generate Voucher Error:", error);

    // Check the condition (!res.headersSent) and run the matching branch.
    if (!res.headersSent) {
      // Return the result of res.status(500).json() to the caller.
      return res.status(500).json({
        success: false,
        message: "Unable to generate booking voucher.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }

    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
