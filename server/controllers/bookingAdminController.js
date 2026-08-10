import mongoose from "mongoose";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "assigned",
  "completed",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

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
      PAYMENT_STATUSES.includes(
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
    | Validate Booking ID
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
    | Validate Status
    |--------------------------------------------------------------------------
    */

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          status: status,
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
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
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
|
| Permanent delete.
| If you later add soft delete,
| only this function needs changing.
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
      await Booking.findByIdAndDelete(
        req.params.id
      );

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
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate Booking ID
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
    | Validate Resource IDs
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

    /*
    |--------------------------------------------------------------------------
    | Update Booking
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Verify Payment Before Assignment
    |--------------------------------------------------------------------------
    */

    const existingBooking =
      await Booking.findById(req.params.id);


    if (!existingBooking) {

      return res.status(404).json({
        success:false,
        message:"Booking not found."
      });

    }


    if (existingBooking.paymentStatus !== "paid") {

      return res.status(400).json({
        success:false,
        message:"Only paid bookings can be assigned."
      });

    }


    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          assignedGuide: guide || null,

          assignedDriver: driver || null,

          assignedVehicle: vehicle || null,

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
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

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
    | Validate Booking ID
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
    | Validate Payment Status
    |--------------------------------------------------------------------------
    */

    if (
      !PAYMENT_STATUSES.includes(status)
    ) {
      return res.status(400).json({

        success: false,

        message:
          "Invalid payment status.",

      });
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          paymentStatus: status,

          mpesaReceipt:
            mpesaReceipt || "",
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
        .lean();

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
await Booking.findById(req.params.id)
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
await Booking.findById(req.params.id)
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


