import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";

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

export const getAllBookings = async (req, res, next) => {
  requireTenantId();
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentStatus,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);

    const pageSize = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (currentPage - 1) * pageSize;

    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search) {
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

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

    if (
      status &&
      BOOKING_STATUSES.includes(
        status
      )
    ) {
      filter.status =
        status;
    }

    if (
      paymentStatus &&
      BOOKING_PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      filter.paymentStatus =
        paymentStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    const [bookings, total] =
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

      ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

      success: true,

      count: bookings.length,

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

    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| ROUTE ALIAS
|--------------------------------------------------------------------------
*/

export const getBookings =
  getAllBookings;

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBookingById = async (
  req,
  res,
  next
) => {
  try {

    if (
      !isValidId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking =
      await Booking.findById(
        req.params.id
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

    if (!booking) {
      return res.status(404).json({

        success: false,

        message:
          "Booking not found.",

      });
    }

    res.status(200).json({

      success: true,

      data: booking,

    });

  } catch (error) {

    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| ROUTE ALIAS
|--------------------------------------------------------------------------
*/

export const getBooking =
  getBookingById;/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOKING ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
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

    if (!isValidBookingStatus(status)) {
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

    const existingBooking =
      await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!existingBooking) {
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

    if (existingBooking.status === status) {
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

    if (
      !canTransitionBookingStatus(
        existingBooking.status,
        status
      )
    ) {
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

    if (
      status === "completed" &&
      existingBooking.paymentStatus !== "paid"
    ) {
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

    if (!booking) {
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

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully.",
      data: booking,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BOOKING
|--------------------------------------------------------------------------
*/

export const deleteBooking = async (
  req,
  res,
  next
) => {
  try {

    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
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

    const booking =
      await 
Booking.findOneAndDelete(
mergeTenantFilter(req,{
_id:req.params.id
})
)
;

    if (!booking) {

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

    res.status(200).json({

      success: true,

      message:
        "Booking deleted successfully.",

    });

  } catch (error) {

    next(error);

  }
};/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE / DRIVER / VEHICLE
|--------------------------------------------------------------------------
*/

export const assignResources = async (
  req,
  res,
  next
) => {
  try {
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

    if (!isValidId(req.params.id)) {
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

    if (guide && !isValidId(guide)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    if (driver && !isValidId(driver)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID.",
      });
    }

    if (vehicle && !isValidId(vehicle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID.",
      });
    }

    if (agent && !isValidId(agent)) {
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

    const existingBooking =
      await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!existingBooking) {
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

    if (existingBooking.paymentStatus !== "paid") {
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

    if (existingBooking.status === "assigned") {
      return res.status(400).json({
        success: false,
        message: "Booking is already assigned.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOKING TRANSITION
    |--------------------------------------------------------------------------
    |
    | Assignment must follow the centralized lifecycle:
    |
    | pending -> confirmed -> assigned
    |--------------------------------------------------------------------------
    */

    if (
      !canTransitionBookingStatus(
        existingBooking.status,
        "assigned"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot transition from ` +
          `"${existingBooking.status}" to "assigned".`,
        currentStatus:
          existingBooking.status,
        requestedStatus:
          "assigned",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING
    |--------------------------------------------------------------------------
    */

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

    if (!booking) {
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

    return res.status(200).json({
      success: true,
      message:
        "Resources assigned successfully.",
      data: booking,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      mpesaReceipt,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOKING ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    if (!isValidBookingPaymentStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking payment status.",
        allowedStatuses: BOOKING_PAYMENT_STATUSES,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BOOKING
    |--------------------------------------------------------------------------
    */

    const booking =
      await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!booking) {
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

    if (booking.paymentStatus === status) {
      return res.status(400).json({
        success: false,
        message:
          `Booking payment status is already ${status}.`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PAYMENT TRANSITION
    |--------------------------------------------------------------------------
    */

    if (
      !canTransitionBookingPaymentStatus(
        booking.paymentStatus,
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Payment cannot transition from ` +
          `"${booking.paymentStatus}" to "${status}".`,
        currentPaymentStatus:
          booking.paymentStatus,
        requestedPaymentStatus:
          status,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    booking.paymentStatus = status;

    /*
    |--------------------------------------------------------------------------
    | M-PESA RECEIPT
    |--------------------------------------------------------------------------
    */

    if (mpesaReceipt !== undefined) {
      booking.mpesaReceipt =
        String(mpesaReceipt).trim();
    }

    /*
    |--------------------------------------------------------------------------
    | BOOKING STATUS SYNCHRONIZATION
    |--------------------------------------------------------------------------
    |
    | paid:
    |   pending booking -> confirmed
    |
    | failed/cancelled:
    |   confirmed booking -> pending
    |
    | refunded:
    |   active booking -> refunded
    |--------------------------------------------------------------------------
    */

    if (
      status === "paid" &&
      booking.status === "pending"
    ) {
      booking.status = "confirmed";
    }

    if (
      ["failed", "cancelled"].includes(status) &&
      booking.status === "confirmed"
    ) {
      booking.status = "pending";
    }

    if (
      status === "refunded" &&
      !["completed", "cancelled"].includes(
        booking.status
      )
    ) {
      booking.status = "refunded";
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    await booking.save();

    /*
    |--------------------------------------------------------------------------
    | POPULATE RESPONSE
    |--------------------------------------------------------------------------
    */

    await booking.populate([
      {
        path: "customer",
        select: "name email phone",
      },
      {
        path: "tour",
        select: "title",
      },
    ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully.",
      data: booking,
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| BOOKING TIMELINE
|--------------------------------------------------------------------------
*/

export const getBookingTimeline = async(
req,
res,
next
)=>{

try{

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


if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}


const timeline=[

{
event:"Booking Created",
status:"created",
date:booking.createdAt
},

{
event:`Payment ${booking.paymentStatus}`,
status:booking.paymentStatus,
date:booking.paidAt || null
},

{
event:`Booking ${booking.status}`,
status:booking.status,
date:booking.updatedAt
}

];


res.json({

success:true,

timeline

});


}catch(error){

next(error);

}

};



/*
|--------------------------------------------------------------------------
| BOOKING INVOICE
|--------------------------------------------------------------------------
*/

export const downloadBookingInvoice =
async(req,res,next)=>{

try{

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


if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}


res.setHeader(
"Content-Type",
"text/plain"
);


res.send(
`
COHERENT TOURS

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

next(error);

}

};



export const sendBookingNotification =
async(req,res,next)=>{

try{


res.json({

success:true,

message:
"Notification queued successfully."

});


}catch(error){

next(error)

}

};


