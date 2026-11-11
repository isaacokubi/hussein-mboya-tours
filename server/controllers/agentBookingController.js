/**
 * Purpose: agent Booking Controller HTTP controller. Main declarations: isValidId, createBooking, getAgentBookings, getAgentBooking, updateBookingStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";


// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import { BOOKING_STATUSES, canTransitionBookingStatus } from "../constants/bookingConstants.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../services/commissionService.js so this module can use its exported dependencies.
import { createCommission } from "../services/commissionService.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);



/*
|--------------------------------------------------------------------------
| CREATE AGENT BOOKING
|--------------------------------------------------------------------------
*/

// Declare createBooking for use by the surrounding module or function.
export const createBooking = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | AGENT
    |--------------------------------------------------------------------------
    */

    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile = await Agent.findOne({
      user: req.user._id,
    }).session(session);

    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Check the condition (!agentProfile.isApproved || agentProfile.status !== "active") and run the matching branch.
    if (
      !agentProfile.isApproved ||
      agentProfile.status !== "active"
    ) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({
        success: false,
        message:
          "Agent account is not approved or active.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST
    |--------------------------------------------------------------------------
    */

    // Declare { customer, tour, travelDate, travelers, pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests, paymentMethod, customerNotes, } for use by the surrounding module or function.
    const {
      customer,
      tour,
      travelDate,
      travelers,
      pickupLocation,
      pickupTime,
      hotelName,
      roomNumber,
      emergencyContact,
      specialRequests,
      paymentMethod,
      customerNotes,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE IDS
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(customer) || !isValidId(tour)) and run the matching branch.
    if (
      !isValidId(customer) ||
      !isValidId(tour)
    ) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid customer or tour.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TRAVEL DATE
    |--------------------------------------------------------------------------
    */

    // Check the condition (!travelDate || Number.isNaN(Date.parse(travelDate))) and run the matching branch.
    if (!travelDate || Number.isNaN(Date.parse(travelDate))) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "A valid travel date is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TRAVELERS
    |--------------------------------------------------------------------------
    */

    // Check the condition (!Array.isArray(travelers) || travelers.length === 0) and run the matching branch.
    if (
      !Array.isArray(travelers) ||
      travelers.length === 0
    ) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "At least one traveler is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND TOUR + CUSTOMER
    |--------------------------------------------------------------------------
    */

    // Declare [tourData, customerData] for use by the surrounding module or function.
    const [tourData, customerData] =
      await Promise.all([
        Tour.findOne({
          _id: tour,
          isDeleted: false,
        }).session(session),

        Customer.findOne({
          _id: customer,
          agent: agentProfile._id,
          isDeleted: false,
        }).session(session),
      ]);

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    // Check the condition (!tourData) and run the matching branch.
    if (!tourData) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    // Check the condition (!customerData) and run the matching branch.
    if (!customerData) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message:
          "Customer not found or does not belong to this agent.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TOUR STATUS
    |--------------------------------------------------------------------------
    */

    // Check the condition (tourData.status === "inactive" || tourData.status === "sold_out") and run the matching branch.
    if (
      tourData.status === "inactive" ||
      tourData.status === "sold_out"
    ) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "This tour is not currently available.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    // Declare price for use by the surrounding module or function.
    const price = Number(
      tourData.agentPrice ??
      tourData.price ??
      0
    );

    // Check the condition (!Number.isFinite(price) || price < 0) and run the matching branch.
    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      // Perform the side effect or state update expressed on the following line.
      await session.abortTransaction();

      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid tour price.",
      });
    }

    // Declare travelerCount for use by the surrounding module or function.
    const travelerCount =
      travelers.length;

    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount =
      price * travelerCount;

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER NAME
    |--------------------------------------------------------------------------
    */

    // Declare customerName for use by the surrounding module or function.
    const customerName =
      `${customerData.firstName || ""} ${
        customerData.lastName || ""
      }`.trim();

    /*
    |--------------------------------------------------------------------------
    | BOOKING DATA
    |--------------------------------------------------------------------------
    */

    // Declare bookingData for use by the surrounding module or function.
    const bookingData = {
      customer: customerData._id,

      user: customerData.user || null,

      customerSnapshot: {
        name: customerName,
        email: customerData.email || "",
        phone: customerData.phone || "",
      },

      bookingSource: "agent",

      contact: {
        name: customerName,
        email: customerData.email || "",
        phone: customerData.phone || "",
      },

      agent: agentProfile._id,

      tour: tourData._id,

      travelDate: new Date(travelDate),

      travelers,

      numberOfGuests: travelerCount,

      pickupLocation:
        pickupLocation || "",

      pickupTime:
        pickupTime
          ? new Date(pickupTime)
          : null,

      hotelName:
        hotelName || "",

      roomNumber:
        roomNumber || "",

      emergencyContact:
        emergencyContact || {},

      specialRequests:
        Array.isArray(specialRequests)
          ? specialRequests
          : [],

      subtotal: totalAmount,

      totalAmount,

      commissionRate:
        Number(agentProfile.commissionRate) || 0,

      paymentMethod:
        paymentMethod || "MPESA",

      paymentStatus: "pending",

      customerNotes:
        customerNotes || "",

      status: "pending",

      createdBy: req.user._id,

      updatedBy: req.user._id,

      isDeleted: false,
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    // Declare booking for use by the surrounding module or function.
    const booking =
      await Booking.create(
        [bookingData],
        { session }
      );

    /*
    |--------------------------------------------------------------------------
    | COMMISSION
    |--------------------------------------------------------------------------
    */

    // Check the condition (typeof createCommission === "function") and run the matching branch.
    if (
      typeof createCommission === "function"
    ) {
      // Perform the side effect or state update expressed on the following line.
      await createCommission(
        booking[0],
        session
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CUSTOMER STATISTICS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    customerData.totalBookings =
      Number(customerData.totalBookings || 0) + 1;

    // Perform the side effect or state update expressed on the following line.
    customerData.lastBookingDate =
      new Date();

    // Perform the side effect or state update expressed on the following line.
    await customerData.save({
      session,
    });

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    await session.commitTransaction();

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      message:
        "Agent booking created successfully.",
      booking: booking[0],
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    await session.abortTransaction();
    // Perform the side effect or state update expressed on the following line.
    next(error);
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| GET AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

// Declare getAgentBookings for use by the surrounding module or function.
export const getAgentBookings = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare page for use by the surrounding module or function.
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    // Declare skip for use by the surrounding module or function.
    const skip =
      (page - 1) * limit;

    // Declare filter for use by the surrounding module or function.
    const filter = {
      agent: agentProfile._id,
      isDeleted: false,
    };

    // Check the condition (req.query.status && BOOKING_STATUSES.includes( req.query.status )) and run the matching branch.
    if (
      req.query.status &&
      BOOKING_STATUSES.includes(
        req.query.status
      )
    ) {
      // Perform the side effect or state update expressed on the following line.
      filter.status =
        req.query.status;
    }

    // Check the condition (req.query.paymentStatus) and run the matching branch.
    if (req.query.paymentStatus) {
      // Perform the side effect or state update expressed on the following line.
      filter.paymentStatus =
        req.query.paymentStatus;
    }

    // Check the condition (req.query.search) and run the matching branch.
    if (req.query.search) {
      // Declare search for use by the surrounding module or function.
      const search =
        String(req.query.search)
          .trim();

      // Perform the side effect or state update expressed on the following line.
      filter.$or = [
        {
          "customerSnapshot.name": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "customerSnapshot.email": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "customerSnapshot.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          bookingNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Declare [ bookings, total, ] for use by the surrounding module or function.
    const [
      bookings,
      total,
    ] = await Promise.all([
      Booking.find(filter)
        .populate(
          "tour",
          "title price agentPrice duration destination"
        )
        .populate(
          "customer",
          "firstName lastName email phone"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Booking.countDocuments(filter),
    ]);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(
        total / limit
      ),
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE AGENT BOOKING
|--------------------------------------------------------------------------
*/

// Declare getAgentBooking for use by the surrounding module or function.
export const getAgentBooking = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (
      !isValidId(req.params.id)
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare booking for use by the surrounding module or function.
    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      })
        .populate(
          "tour"
        )
        .populate(
          "customer"
        )
        .populate(
          "user",
          "name email phone"
        );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (
      !isValidId(req.params.id)
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Declare { status } for use by the surrounding module or function.
    const { status } =
      req.body;

    // Check the condition (!BOOKING_STATUSES.includes( status )) and run the matching branch.
    if (
      !BOOKING_STATUSES.includes(
        status
      )
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status.",
      });
    }

    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare booking for use by the surrounding module or function.
    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      });

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Check the condition (booking.status === status) and run the matching branch.
    if (booking.status === status) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Booking is already ${status}.`,
      });
    }

    // Check the condition (!canTransitionBookingStatus(booking.status, status)) and run the matching branch.
    if (!canTransitionBookingStatus(booking.status, status)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        message: `Booking cannot transition from "${booking.status}" to "${status}".`,
        currentStatus: booking.status,
        requestedStatus: status,
      });
    }

    // Check the condition (["ongoing", "completed"].includes(status) && String(booking.paymentSta) and run the matching branch.
    if (["ongoing", "completed"].includes(status) && String(booking.paymentStatus || "").toLowerCase() !== "paid") {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        code: "PAYMENT_REQUIRED_BEFORE_COMPLETION",
        message: "Only fully paid bookings can be moved into an active or completed trip state.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.status = status;

    // Perform the side effect or state update expressed on the following line.
    booking.updatedBy =
      req.user._id;

    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully.",
      booking,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE / CANCEL AGENT BOOKING
|--------------------------------------------------------------------------
*/

// Declare cancelAgentBooking for use by the surrounding module or function.
export const cancelAgentBooking = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (
      !isValidId(req.params.id)
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile =
      await Agent.findOne({
        user: req.user._id,
      });

    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare booking for use by the surrounding module or function.
    const booking =
      await Booking.findOne({
        _id: req.params.id,
        agent: agentProfile._id,
        isDeleted: false,
      });

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Check the condition (booking.status === "completed") and run the matching branch.
    if (
      booking.status === "completed"
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be cancelled.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.status =
      "cancelled";

    // Perform the side effect or state update expressed on the following line.
    booking.cancelledAt =
      new Date();

    // Perform the side effect or state update expressed on the following line.
    booking.cancelledBy =
      req.user._id;

    // Perform the side effect or state update expressed on the following line.
    booking.cancellationReason =
      req.body.reason || "";

    // Perform the side effect or state update expressed on the following line.
    booking.updatedBy =
      req.user._id;

    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully.",
      booking,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

export default {
  createBooking,
  getAgentBookings,
  getAgentBooking,
  updateBookingStatus,
  cancelAgentBooking,
};
