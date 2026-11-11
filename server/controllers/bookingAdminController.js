/**
 * Purpose: booking Admin Controller HTTP controller. Main declarations: isValidId, getAllBookings, getBookingById, updateBookingStatus, deleteBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../services/emailService.js so this module can use its exported dependencies.
import { sendBookingStatusEmail, sendEmailBestEffort } from "../services/emailService.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";

// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import {
  BOOKING_STATUSES,
  BOOKING_PAYMENT_STATUSES,
  isValidBookingStatus,
  isValidBookingPaymentStatus,
  canTransitionBookingStatus,
  canTransitionBookingPaymentStatus,
} from "../constants/bookingConstants.js";

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
| GET ALL BOOKINGS (ADMIN)
|--------------------------------------------------------------------------
|
| Supports:
| • Pagination
| • Search
| • Booking Status Filter
| • Payment Status Filter
|--------------------------------------------------------------------------
*/

// Declare getAllBookings for use by the surrounding module or function.
export const getAllBookings = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { page = 1, limit = 20, search, status, paymentStatus, } for use by the surrounding module or function.
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentStatus,
    } = req.query;

    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page), 1);

    // Declare pageSize for use by the surrounding module or function.
    const pageSize = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    // Declare skip for use by the surrounding module or function.
    const skip =
      (currentPage - 1) * pageSize;

    // Every admin booking query must be tenant scoped. The previous KPI change
    // accidentally built an unscoped filter, which could also produce incorrect
    // cross-tenant metrics in a multi-tenant installation.
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, {});

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    // Check the condition (search) and run the matching branch.
    if (search) {
      // Declare regex for use by the surrounding module or function.
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

      // Perform the side effect or state update expressed on the following line.
      filter.$or = [
        { bookingNumber: regex },
        { "customerSnapshot.name": regex },
        { "customerSnapshot.email": regex },
        { "customerSnapshot.phone": regex },
        { "contact.name": regex },
        { "contact.email": regex },
        { "contact.phone": regex },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | FILTERS
    |--------------------------------------------------------------------------
    */

    // Check the condition (status && BOOKING_STATUSES.includes( status )) and run the matching branch.
    if (
      status &&
      BOOKING_STATUSES.includes(
        status
      )
    ) {
      // Perform the side effect or state update expressed on the following line.
      filter.status =
        status;
    }

    // Check the condition (paymentStatus && BOOKING_PAYMENT_STATUSES.includes( paymentStatus )) and run the matching branch.
    if (
      paymentStatus &&
      BOOKING_PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      // Perform the side effect or state update expressed on the following line.
      filter.paymentStatus =
        paymentStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    // Declare [bookings, total, metricBookings] for use by the surrounding module or function.
    const [bookings, total, metricBookings] =
      await Promise.all([

        Booking.find(filter)

          .populate(
            "customer",
            "name email phone user"
          )

          .populate(
            "user",
            "name email phone"
          )

          .populate(
            "tour",
            "title"
          )

          .populate(
            "assignedGuide",
            "name"
          )

          .populate(
            "assignedDriver",
            "name"
          )

          .populate(
            "assignedVehicle",
            "name registrationNumber"
          )

          .sort({
            createdAt: -1,
          })

          .skip(skip)

          .limit(pageSize)

          .lean(),

        Booking.countDocuments(filter),

        // Dashboard KPIs must be calculated from the complete filtered result,
        // not only the current pagination page. This prevents page 1 from
        // reporting a partial revenue total when there are more bookings.
        Booking.find(filter).select("paymentStatus totalAmount depositAmount refundAmount").lean(),

      ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    // Declare pendingPayments for use by the surrounding module or function.
    const pendingPayments = metricBookings.filter((booking) =>
      ["pending", "partial"].includes(
        String(booking.paymentStatus || "").toLowerCase()
      )
    ).length;
    // Declare paidBookingCount for use by the surrounding module or function.
    const paidBookingCount = metricBookings.filter(
      (booking) => String(booking.paymentStatus || "").toLowerCase() === "paid"
    ).length;
    // Declare cancelled for use by the surrounding module or function.
    const cancelled = metricBookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;
    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({

      success: true,

      count: bookings.length,

      metrics: {
        totalBookings: total,
        pendingPayments,
        paid: paidBookingCount,
        cancelled,
        // Booking Management intentionally does not expose a revenue KPI.
        // Revenue is calculated by the dedicated canonical financial service
        // so operational booking totals cannot be mistaken for accounting revenue.
      },

      pagination: {

        total,

        page: currentPage,

        pages: Math.ceil(
          total / pageSize
        ),

        limit: pageSize,

      },

      data: bookings,

    });

  } catch (error) {

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| ROUTE ALIAS
|--------------------------------------------------------------------------
*/

// Declare getBookings for use by the surrounding module or function.
export const getBookings =
  getAllBookings;

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

// Declare getBookingById for use by the surrounding module or function.
export const getBookingById = async (
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

    // Declare booking for use by the surrounding module or function.
    const booking =
      await Booking.findOne(
        mergeTenantFilter(req, { _id: req.params.id })
      )

        .populate(
          "customer",
          "name email phone"
        )

        .populate(
          "tour"
        )

        .populate(
          "assignedGuide",
          "name email"
        )

        .populate(
          "assignedDriver",
          "name email"
        )

        .populate(
          "assignedVehicle"
        )

        .lean();

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({

        success: false,

        message:
          "Booking not found.",

      });
    }

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({

      success: true,

      data: booking,

    });

  } catch (error) {

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| ROUTE ALIAS
|--------------------------------------------------------------------------
*/

// Declare getBooking for use by the surrounding module or function.
export const getBooking =
  getBookingById;/*
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
    // Declare { status } for use by the surrounding module or function.
    const { status } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOKING ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE STATUS
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidBookingStatus(status)) and run the matching branch.
    if (!isValidBookingStatus(status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
        allowedStatuses: BOOKING_STATUSES,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */

    // Declare existingBooking for use by the surrounding module or function.
    const existingBooking =
      await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    // Check the condition (!existingBooking) and run the matching branch.
    if (!existingBooking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NO-OP PROTECTION
    |--------------------------------------------------------------------------
    */

    // Check the condition (existingBooking.status === status) and run the matching branch.
    if (existingBooking.status === status) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Booking is already ${status}.`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE STATUS TRANSITION
    |--------------------------------------------------------------------------
    */

    // Check the condition (!canTransitionBookingStatus( existingBooking.status, status )) and run the matching branch.
    if (
      !canTransitionBookingStatus(
        existingBooking.status,
        status
      )
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot transition from ` +
          `"${existingBooking.status}" to "${status}".`,
        currentStatus: existingBooking.status,
        requestedStatus: status,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT PROTECTION
    |--------------------------------------------------------------------------
    |
    | A booking cannot be completed unless payment is confirmed.
    |--------------------------------------------------------------------------
    */

    // Check the condition (status === "completed" && existingBooking.paymentStatus !== "paid") and run the matching branch.
    if (
      status === "completed" &&
      existingBooking.paymentStatus !== "paid"
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          "A booking must have paid payment status before it can be completed.",
        paymentStatus:
          existingBooking.paymentStatus,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING
    |--------------------------------------------------------------------------
    */

    // Declare booking for use by the surrounding module or function.
    const booking =
      await
Booking.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "tour",
          "title"
        )
        .populate(
          "assignedGuide",
          "name"
        )
        .populate(
          "assignedDriver",
          "name"
        )
        .populate(
          "assignedVehicle",
          "name registrationNumber"
        );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    await sendEmailBestEffort(() => sendBookingStatusEmail(booking, status, req.body?.reason || ""), "Booking status");

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully.",
      data: booking,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BOOKING
|--------------------------------------------------------------------------
*/

// Declare deleteBooking for use by the surrounding module or function.
export const deleteBooking = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {

    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({

        success: false,

        message: "Invalid booking ID.",

      });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    // Declare booking for use by the surrounding module or function.
    const booking =
      await
Booking.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
)
;

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {

      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({

        success: false,

        message:
          "Booking not found.",

      });

    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({

      success: true,

      message:
        "Booking deleted successfully.",

    });

  } catch (error) {

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE / DRIVER / VEHICLE
|--------------------------------------------------------------------------
*/

// Declare assignResources for use by the surrounding module or function.
export const assignResources = async (
  req,
  res,
  next
) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { guide, driver, vehicle, agent, } for use by the surrounding module or function.
    const {
      guide,
      driver,
      vehicle,
      agent,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOKING ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESOURCE IDs
    |--------------------------------------------------------------------------
    */

    // Check the condition (guide && !isValidId(guide)) and run the matching branch.
    if (guide && !isValidId(guide)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    // Check the condition (driver && !isValidId(driver)) and run the matching branch.
    if (driver && !isValidId(driver)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID.",
      });
    }

    // Check the condition (vehicle && !isValidId(vehicle)) and run the matching branch.
    if (vehicle && !isValidId(vehicle)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID.",
      });
    }

    // Check the condition (agent && !isValidId(agent)) and run the matching branch.
    if (agent && !isValidId(agent)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */

    // Declare existingBooking for use by the surrounding module or function.
    const existingBooking =
      await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    // Check the condition (!existingBooking) and run the matching branch.
    if (!existingBooking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT PROTECTION
    |--------------------------------------------------------------------------
    |
    | Only paid bookings may receive operational resources.
    |--------------------------------------------------------------------------
    */

    // Check the condition (existingBooking.paymentStatus !== "paid") and run the matching branch.
    if (existingBooking.paymentStatus !== "paid") {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be assigned.",
        paymentStatus:
          existingBooking.paymentStatus,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NO-OP PROTECTION
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ASSIGN OR REASSIGN
    |--------------------------------------------------------------------------
    |
    | A paid confirmed booking can be assigned. Once assigned, administrators
    | may change the guide, driver or vehicle without forcing another lifecycle
    | transition.
    |--------------------------------------------------------------------------
    */

    // Check the condition (existingBooking.status !== "assigned" && !canTransitionBookingStatus( ) and run the matching branch.
    if (
      existingBooking.status !== "assigned" &&
      !canTransitionBookingStatus(
        existingBooking.status,
        "assigned"
      )
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot transition from ` +
          `"${existingBooking.status}" to "assigned".`,
        currentStatus: existingBooking.status,
        requestedStatus: "assigned",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING
    |--------------------------------------------------------------------------
    */

    // Declare booking for use by the surrounding module or function.
    const booking =
      await
Booking.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

        {
          assignedGuide: guide || null,
          assignedDriver: driver || null,
          assignedVehicle: vehicle || null,
          agent: agent || null,
          status: "assigned",
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "tour",
          "title"
        )
        .populate(
          "assignedGuide",
          "name email phone"
        )
        .populate(
          "assignedDriver",
          "name email phone"
        )
        .populate(
          "assignedVehicle",
          "name registrationNumber"
        );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message:
        "Resources assigned successfully.",
      data: booking,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

// Declare updatePaymentStatus for use by the surrounding module or function.
export const updatePaymentStatus = async (
  req,
  res
) => {
  // Return the result of res.status(410).json() to the caller.
  return res.status(410).json({
    success: false,
    code: "BOOKING_PAYMENT_STATUS_READ_ONLY",
    message: "Booking payment status is derived from the verified Payment ledger. Use the payment lifecycle workflow instead of editing booking.paymentStatus directly.",
  });
};

/*
|--------------------------------------------------------------------------
| BOOKING TIMELINE
|--------------------------------------------------------------------------
*/

// Declare getBookingTimeline for use by the surrounding module or function.
export const getBookingTimeline = async(
req,
res,
next
)=>{

// Run this operation with a dedicated error-handling path for failures.
try{

// Declare booking for use by the surrounding module or function.
const booking =
await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
.populate(
"customer",
"name email phone"
)
.populate(
"tour",
"title"
)
.lean();


// Check the condition (!booking) and run the matching branch.
if(!booking){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({

success:false,

message:"Booking not found"

});

}


// Declare paymentRecord for use by the surrounding module or function.
const paymentRecord = await Payment.findOne(
mergeTenantFilter(req,{
booking: booking._id,
status: { $in: ["completed", "refunded"] }
})
)
.sort({ paidAt: -1, updatedAt: -1, createdAt: -1 })
.select("status amount paidAt updatedAt createdAt transactionReference transactionId mpesaReceiptNumber")
.lean();

// Declare paymentDate for use by the surrounding module or function.
const paymentDate =
paymentRecord?.paidAt ||
(paymentRecord?.status === "completed" ? paymentRecord?.updatedAt : null) ||
(paymentRecord?.status === "completed" ? paymentRecord?.createdAt : null) ||
null;

// Declare timeline for use by the surrounding module or function.
const timeline=[

{
event:"Booking Created",
status:"created",
date:booking.createdAt
},

{
event:`Payment ${booking.paymentStatus}`,
status:booking.paymentStatus,
date:paymentDate,
amount: paymentRecord?.amount ?? null,
paymentReference:
paymentRecord?.transactionReference ||
paymentRecord?.transactionId ||
paymentRecord?.mpesaReceiptNumber ||
null,
},

{
event:`Booking ${booking.status}`,
status:booking.status,
date:booking.updatedAt
}

];


// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

timeline

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};



/*
|--------------------------------------------------------------------------
| BOOKING INVOICE
|--------------------------------------------------------------------------
*/

// Declare downloadBookingInvoice for use by the surrounding module or function.
export const downloadBookingInvoice =
async(req,res,next)=>{

// Run this operation with a dedicated error-handling path for failures.
try{

// Declare booking for use by the surrounding module or function.
const booking =
await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
.populate(
"customer",
"name email phone"
)
.populate(
"tour",
"title"
);


// Check the condition (!booking) and run the matching branch.
if(!booking){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({

success:false,

message:"Booking not found"

});

}


// Perform the side effect or state update expressed on the following line.
res.setHeader(
"Content-Type",
"text/plain"
);


// Perform the side effect or state update expressed on the following line.
res.send(
`
GLOBAL TOURS

BOOKING INVOICE

Booking ID:
${booking._id}

Customer:
${booking.customer?.name || ""}

Tour:
${booking.tour?.title || ""}

Amount:
KES ${booking.totalAmount || 0}

Payment:
${booking.paymentStatus}

Status:
${booking.status}

Generated:
${new Date().toISOString()}

`
);


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};



// Declare sendBookingNotification for use by the surrounding module or function.
export const sendBookingNotification = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) return res.status(400).json({ success:false, message:"Invalid booking ID." });
    // Declare message for use by the surrounding module or function.
    const message = String(req.body?.message || "").trim();
    // Check the condition (!message) and run the matching branch.
    if (!message) return res.status(400).json({ success:false, message:"Notification message is required." });

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .populate("customer", "name email phone user")
      .populate("user", "name email phone")
      .lean();
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });

    // Declare recipient for use by the surrounding module or function.
    const recipient = booking.user?._id || booking.user || booking.customer?.user;
    // Check the condition (!recipient) and run the matching branch.
    if (!recipient) return res.status(400).json({ success:false, message:"This booking does not have a customer user account for in-app notifications." });

    // Declare notification for use by the surrounding module or function.
    const notification = await Notification.create({
      recipient,
      user: recipient,
      title: "Booking Update",
      message,
      type: "booking",
      priority: "normal",
      read: false,
      actionUrl: "/bookings/" + booking._id,
      relatedModel: "Booking",
      relatedId: booking._id,
      metadata: { bookingId: booking._id, bookingNumber: booking.bookingNumber, sentBy: req.user?._id || null, channel: "in_app" },
      isSent: true,
      isArchived: false,
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success:true, message:"Booking notification sent successfully.", notification, channel:"in_app" });
  } catch (error) { next(error); }
};
