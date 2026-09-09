import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { mergeTenantFilter } from "../tenancy/context.js";
import { successResponse } from "../utils/apiResponse.js";

const isPrivilegedBookingViewer = (user) => {
  const role = String(
    user?.roleId?.name || user?.role || user?.legacyRole || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

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
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

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

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!isPrivilegedBookingViewer(req.user)) {
      const requesterId = String(req.user?._id || req.user?.id || "");
      const userOwnerId = booking.user?._id || booking.user;
      const customerUserId = booking.customer?.user?._id || booking.customer?.user;
      const customerId = booking.customer?._id || booking.customer;

      const ownsAsUser = String(userOwnerId || "") === requesterId;
      const ownsThroughCustomer =
        String(customerUserId || "") === requesterId ||
        String(customerId || "") === requesterId;

      if (!ownsAsUser && !ownsThroughCustomer) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this booking.",
        });
      }
    }

    return successResponse(
      res,
      200,
      "Booking retrieved successfully",
      { booking }
    );
  } catch (error) {
    return next(error);
  }
};

export default getBookingById;
