/**
 * Purpose: booking Retrieval Controller HTTP controller. Main declarations: isPrivilegedBookingViewer, getBookingById.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../utils/apiResponse.js so this module can use its exported dependencies.
import { successResponse } from "../utils/apiResponse.js";

// Declare isPrivilegedBookingViewer for use by the surrounding module or function.
const isPrivilegedBookingViewer = (user) => {
  // Declare role for use by the surrounding module or function.
  const role = String(
    user?.roleId?.name || user?.role || user?.legacyRole || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  // Return the result of [     "admin",     "super_admin",     "administrator",     "manager",     "tourmanager",     "guide",     "tourguide",     "agent",     "travelagent",   ].includes() to the caller.
  return [
    "admin",
    "super_admin",
    "administrator",
    "manager",
    "tourmanager",
    "guide",
    "tourguide",
    "agent",
    "travelagent",
  ].includes(role);
};

/**
 * Lightweight single-booking read endpoint.
 *
 * The legacy controller populated the complete Tour, Staff and Vehicle
 * documents for every request. Some Tour documents contain large itinerary,
 * gallery and availability structures, making this endpoint unnecessarily
 * expensive and capable of holding an HTTP request open while MongoDB and
 * Mongoose hydrate the related documents.
 *
 * This endpoint deliberately returns the fields required by customer payment
 * and booking-detail screens while keeping tenant isolation explicit.
 */
// Declare getBookingById for use by the surrounding module or function.
export const getBookingById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params;

    // Check the condition (!mongoose.Types.ObjectId.isValid(id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter(req, {
        _id: id,
        isDeleted: { $ne: true },
      })
    )
      .populate("tour", "_id title slug destination price discountPrice durationDays")
      .populate("user", "_id name email phone")
      .populate("customer", "_id name email phone user")
      .populate("assignedGuide", "_id name email phone")
      .populate("assignedDriver", "_id name email phone")
      .populate("assignedVehicle", "_id name registrationNumber")
      .lean();

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check the condition (!isPrivilegedBookingViewer(req.user)) and run the matching branch.
    if (!isPrivilegedBookingViewer(req.user)) {
      // Declare requesterId for use by the surrounding module or function.
      const requesterId = String(req.user?._id || req.user?.id || "");
      // Declare userOwnerId for use by the surrounding module or function.
      const userOwnerId = booking.user?._id || booking.user;
      // Declare customerUserId for use by the surrounding module or function.
      const customerUserId = booking.customer?.user?._id || booking.customer?.user;
      // Declare customerId for use by the surrounding module or function.
      const customerId = booking.customer?._id || booking.customer;

      // Declare ownsAsUser for use by the surrounding module or function.
      const ownsAsUser = String(userOwnerId || "") === requesterId;
      // Declare ownsThroughCustomer for use by the surrounding module or function.
      const ownsThroughCustomer =
        String(customerUserId || "") === requesterId ||
        String(customerId || "") === requesterId;

      // Check the condition (!ownsAsUser && !ownsThroughCustomer) and run the matching branch.
      if (!ownsAsUser && !ownsThroughCustomer) {
        // Return the result of res.status(403).json() to the caller.
        return res.status(403).json({
          success: false,
          message: "You do not have access to this booking.",
        });
      }
    }

    // Return the result of successResponse() to the caller.
    return successResponse(
      res,
      200,
      "Booking retrieved successfully",
      { booking }
    );
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

export default getBookingById;
