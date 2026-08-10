import Booking from "../models/Booking.js";
import { generateCSV } from "../services/reportService.js";

/*
|--------------------------------------------------------------------------
| EXPORT BOOKINGS REPORT
|--------------------------------------------------------------------------
| GET /api/admin/reports/bookings/export
|--------------------------------------------------------------------------
*/

export const exportBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus, from, to } = req.query;

    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL FILTERS
    |--------------------------------------------------------------------------
    */

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = new Date(from);
      }

      if (to) {
        filter.createdAt.$lte = new Date(to);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH BOOKINGS
    |--------------------------------------------------------------------------
    */

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .populate("tour", "title destination")
      .sort({
        createdAt: -1,
      });

    /*
    |--------------------------------------------------------------------------
    | GENERATE CSV
    |--------------------------------------------------------------------------
    */

    const csv = generateCSV(bookings);

    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bookings-report-${Date.now()}.csv`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("EXPORT BOOKINGS ERROR:", error);
    next(error);
  }
};