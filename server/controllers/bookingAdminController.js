import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";

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

    // Every admin booking query must be tenant scoped. The previous KPI change
    // accidentally built an unscoped filter, which could also produce incorrect
    // cross-tenant metrics in a multi-tenant installation.
    const filter = mergeTenantFilter(req, {});

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
        Booking.find(filter).select("paymentStatus totalAmount depositAmount").lean(),

      ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    const paidBookings = metricBookings.filter((booking) => booking.paymentStatus === "paid");
    const pendingPayments = metricBookings.filter((booking) =>
      ["pending", "partial"].includes(String(booking.paymentStatus || "").toLowerCase())
    ).length;
    const cancelled = metricBookings.filter((booking) => booking.status === "cancelled").length;

    // Revenue must remain populated for legacy bookings as well as newer
    // bookings whose cash received is represented in the Payment ledger.
    // Prefer net completed/refunded payments per paid booking; if no ledger
    // entry exists, fall back to the booking's recorded total/deposit.
    const paidBookingIds = paidBookings.map((booking) => booking._id);
    const paymentTotals = paidBookingIds.length
      ? await Payment.aggregate([
          {
            $match: mergeTenantFilter(req, {
              booking: { $in: paidBookingIds },
              status: { $in: ["completed", "refunded"] },
            }),
          },
          {
            $project: {
              booking: 1,
              netAmount: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$booking",
              total: { $sum: "$netAmount" },
            },
          },
        ])
      : [];

    const ledgerByBooking = new Map(
      paymentTotals.map((item) => [String(item._id), Number(item.total || 0)])
    );

    const revenue = paidBookings.reduce((sum, booking) => {
      const ledgerAmount = ledgerByBooking.get(String(booking._id));
      const fallbackAmount = Number(
        booking.totalAmount ?? booking.depositAmount ?? 0
      );
      return sum + Math.max(
        0,
        ledgerAmount !== undefined && ledgerAmount > 0
          ? ledgerAmount
          : fallbackAmount
      );
    }, 0);

    res.status(200).json({

      success: true,

      count: bookings.length,

      metrics: {
        totalBookings: total,
        pendingPayments,
        paid: paidBookings.length,
        cancelled,
        revenue: Math.round(revenue * 100) / 100,
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

    if (
      existingBooking.status !== "assigned" &&
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
        currentStatus: existingBooking.status,
        requestedStatus: "assigned",
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

    // Manual "paid" changes must also create a completed Payment record because
    // finance and analytics dashboards use the Payment ledger as their revenue source.
    if (status === "paid") {
      const paymentCustomer = booking.user || null;
      if (!paymentCustomer) {
        return res.status(400).json({ success: false, message: "This booking has no customer user account, so the paid status cannot be posted to the financial ledger." });
      }
      const completedPayments = await Payment.find(
        mergeTenantFilter(req, { booking: booking._id, status: { $in: ["completed", "refunded"] } })
      ).select("amount refundedAmount").lean();
      const paidAmount = completedPayments.reduce(
        (sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)),
        0
      );
      const outstanding = Math.max(0, Number(booking.totalAmount || 0) - paidAmount);
      if (outstanding > 0) {
        const paymentMethod = String(booking.paymentMethod || "MPESA").toUpperCase();
        const provider = paymentMethod === "BANK_TRANSFER" ? "BANK" : ["CARD", "PAYPAL", "MPESA", "CASH"].includes(paymentMethod) ? paymentMethod : "CASH";
        await Payment.create({
          tenantId: booking.tenantId,
          customer: paymentCustomer,
          user: paymentCustomer,
          booking: booking._id,
          provider,
          method: paymentMethod === "BANK_TRANSFER" ? "bank" : paymentMethod.toLowerCase(),
          paymentMethod,
          amount: outstanding,
          currency: "KES",
          status: "completed",
          transactionReference: booking.paymentReference || ("ADMIN-MANUAL-" + booking.bookingNumber + "-" + Date.now()),
          transactionId: booking.transactionId || "",
          mpesaReceiptNumber: booking.mpesaReceipt || "",
          paidAt: new Date(),
          notes: "Manual payment settlement recorded from Admin Booking Management.",
        });
      }
      booking.depositAmount = Number(booking.totalAmount || 0);
      booking.balanceAmount = 0;
    }

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

next(error);

}

};



export const sendBookingNotification = async (req, res, next) => {
  try {
    requireTenantId();
    if (!isValidId(req.params.id)) return res.status(400).json({ success:false, message:"Invalid booking ID." });
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ success:false, message:"Notification message is required." });

    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .populate("customer", "name email phone user")
      .populate("user", "name email phone")
      .lean();
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });

    const recipient = booking.user?._id || booking.user || booking.customer?.user;
    if (!recipient) return res.status(400).json({ success:false, message:"This booking does not have a customer user account for in-app notifications." });

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
    return res.status(200).json({ success:true, message:"Booking notification sent successfully.", notification, channel:"in_app" });
  } catch (error) { next(error); }
};
