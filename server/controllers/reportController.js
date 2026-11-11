/**
 * Purpose: report Controller HTTP controller. Main declarations: exportBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../services/reportService.js so this module can use its exported dependencies.
import { generateCSV } from "../services/reportService.js";

/*
|--------------------------------------------------------------------------
| EXPORT BOOKINGS REPORT
|--------------------------------------------------------------------------
| GET /api/admin/reports/bookings/export
|--------------------------------------------------------------------------
*/

// Declare exportBookings for use by the surrounding module or function.
export const exportBookings = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { status, paymentStatus, from, to } for use by the surrounding module or function.
    const { status, paymentStatus, from, to } = req.query;

    // Declare filter for use by the surrounding module or function.
    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL FILTERS
    |--------------------------------------------------------------------------
    */

    // Check the condition (status) and run the matching branch.
    if (status) {
      // Perform the side effect or state update expressed on the following line.
      filter.status = status;
    }

    // Check the condition (paymentStatus) and run the matching branch.
    if (paymentStatus) {
      // Perform the side effect or state update expressed on the following line.
      filter.paymentStatus = paymentStatus;
    }

    // Check the condition (from || to) and run the matching branch.
    if (from || to) {
      // Perform the side effect or state update expressed on the following line.
      filter.createdAt = {};

      // Check the condition (from) and run the matching branch.
      if (from) {
        // Perform the side effect or state update expressed on the following line.
        filter.createdAt.$gte = new Date(from);
      }

      // Check the condition (to) and run the matching branch.
      if (to) {
        // Perform the side effect or state update expressed on the following line.
        filter.createdAt.$lte = new Date(to);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH BOOKINGS
    |--------------------------------------------------------------------------
    */

    // Declare bookings for use by the surrounding module or function.
    const bookings = await Booking.find(filter)
      .populate("customer", "name email phone")
      .populate("user", "name email phone")
      .populate("tour", "title destination")
      .sort({
        createdAt: -1,
      });

    /*
    |--------------------------------------------------------------------------
    | GENERATE CSV
    |--------------------------------------------------------------------------
    */

    // Declare rows for use by the surrounding module or function.
    const rows = bookings.map((booking) => ({
      booking: booking.bookingNumber || booking._id,
      customer:
        booking.customer?.name ||
        booking.user?.name ||
        booking.customerSnapshot?.name ||
        booking.contact?.name ||
        "Guest",
      customerEmail:
        booking.customer?.email ||
        booking.user?.email ||
        booking.customerSnapshot?.email ||
        booking.contact?.email ||
        "",
      customerPhone:
        booking.customer?.phone ||
        booking.user?.phone ||
        booking.customerSnapshot?.phone ||
        booking.contact?.phone ||
        "",
      tour: booking.tour?.title || "",
      amount: booking.totalAmount || 0,
      paymentStatus: booking.paymentStatus || "",
      status: booking.status || "",
      travelDate: booking.travelDate || "",
    }));

    // Declare csv for use by the surrounding module or function.
    const csv = generateCSV(rows);

    // Perform the side effect or state update expressed on the following line.
    res.setHeader("Content-Type", "text/csv");

    // Perform the side effect or state update expressed on the following line.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bookings-report-${Date.now()}.csv`
    );

    // Return the result of res.status(200).send() to the caller.
    return res.status(200).send(csv);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("EXPORT BOOKINGS ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
