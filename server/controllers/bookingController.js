import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

import Tour from "../models/Tour.js";

import {
  reserveSlots,
  validateTourCapacity,
  releaseSlots,
} from "../services/inventoryService.js";

import {
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "../constants/bookingConstants.js";

import { calculateBookingAmounts } from "../utils/bookingPricing.js";

import { successResponse } from "../utils/apiResponse.js";


/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async (req, res, next) => {
  try {

    const {
      tour,
      travelDate,
      travelers,
      numberOfGuests,
      contact,
      paymentMethod,
    } = req.body;


    const totalTravellers =
      Number(numberOfGuests) ||
      travelers?.length ||
      1;


    const tourData =
      await Tour.findById(tour);


    if (!tourData) {
      return res.status(404).json({
        success:false,
        message:"Tour not found"
      });
    }


    const capacityAvailable = await validateTourCapacity(
      tour,
      totalTravellers,
      travelDate
    );

    if (!capacityAvailable) {
      return res.status(409).json({
        success: false,
        message: "Not enough available tour slots for this booking.",
      });
    }

    const amounts =
      calculateBookingAmounts(
        tourData,
        totalTravellers
      );

    // Reserve capacity before creating the booking. If booking creation
    // fails, the reservation is released in the catch block below.
    await reserveSlots(tour, totalTravellers);

    let booking;

    try {
      booking = await Booking.create({

        customer:null,

        user:req.user._id,


        customerSnapshot:{
          name:req.user.name || "",
          email:req.user.email || "",
          phone:req.user.phone || ""
        },


        tour,


        travelDate,


        travelers,


        numberOfGuests:
          totalTravellers,


        contact,


        subtotal:
          amounts.subtotal,


        discountAmount:
          amounts.discountAmount,


        totalAmount:
          amounts.totalAmount,


        depositAmount:
          amounts.depositAmount,


        balanceAmount:
          amounts.balanceAmount,


        paymentMethod:
          paymentMethod ||
          PAYMENT_METHODS.MPESA,


        paymentStatus:
          "pending",


        status:
          "pending",




        assigned:false

      });
    } catch (createError) {
      // Roll back the reserved capacity when booking creation fails.
      try {
        await releaseSlots(tour, totalTravellers);
      } catch (releaseError) {
        console.error("BOOKING CAPACITY ROLLBACK ERROR:", releaseError);
      }
      throw createError;
    }

    return successResponse(
      res,
      201,
      "Booking created successfully",
      {
        booking
      }
    );


  } catch(error){

    next(error);

  }
};



/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (req, res, next) => {
  try {

    const page =
      Number(req.query.page) || 1;


    const limit =
      Number(req.query.limit) || 20;


    const skip =
      (page - 1) * limit;


    const filter = {

      $or:[

        {
          user:req.user._id
        },

        {
          customer:req.user._id
        }

      ]

    };


    const total =
      await Booking.countDocuments(filter);



    const bookings =
      await Booking.find(filter)

      .populate("tour")

      .sort({
        createdAt:-1
      })

      .skip(skip)

      .limit(limit)

      .lean();



    return successResponse(
      res,
      200,
      "Bookings retrieved successfully",
      {
        page,
        pages:Math.ceil(total / limit),
        total,
        count:bookings.length,
        bookings
      }
    );


  } catch(error){

    next(error);

  }
};



/*
|--------------------------------------------------------------------------
| ADMIN GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (req,res,next)=>{

try{


const {
status,
paymentStatus,
search
}=req.query;


const page =
Number(req.query.page)||1;


const limit =
Number(req.query.limit)||20;


const skip =
(page-1)*limit;


const filter={};



if(status){
filter.status=status;
}



if(paymentStatus){
filter.paymentStatus=paymentStatus;
}



if(search){

filter.$or=[

{
bookingNumber:{
$regex:search,
$options:"i"
}
},


{
"customerSnapshot.name":{
$regex:search,
$options:"i"
}
},


{
"customerSnapshot.email":{
$regex:search,
$options:"i"
}
}

];

}



const total =
await Booking.countDocuments(filter);



const bookings =
await Booking.find(filter)

.populate(
"customer",
"name email phone"
)

.populate(
"tour",
"title destination price"
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
"assignedVehicle"
)

.sort({
createdAt:-1
})

.skip(skip)

.limit(limit)

.lean();



return res.status(200).json({

success:true,

page,

pages:Math.ceil(total/limit),

total,

count:bookings.length,

bookings

});


}
catch(error){

next(error);

}

};



export const getBookings =
getAllBookings; /*
|--------------------------------------------------------------------------
| GET CONFIRMED BOOKINGS FOR TOUR MANAGER
|--------------------------------------------------------------------------
*/

export const getConfirmedBookings = async (req, res, next) => {
  try {

    const page =
      Number(req.query.page) || 1;


    const limit =
      Number(req.query.limit) || 20;


    const skip =
      (page - 1) * limit;



    const filter = {

      paymentStatus:"paid",

      $or:[

        {
        },

        {
          status:"confirmed"
        }

      ]

    };



    const total =
      await Booking.countDocuments(filter);



    const bookings =
      await Booking.find(filter)

      .populate("tour")

      .populate(
        "customer",
        "name email phone"
      )

      .populate("assignedGuide")

      .populate("assignedDriver")

      .populate("assignedVehicle")

      .sort({
        travelDate:1
      })

      .skip(skip)

      .limit(limit)

      .lean();



    return res.status(200).json({

      success:true,

      page,

      pages:
        Math.ceil(total / limit),

      total,

      count:
        bookings.length,

      bookings

    });


  } catch(error){

    next(error);

  }
};




/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

const isPrivilegedBookingViewer = (user) => {
  const role = String(
    user?.roleId?.name || user?.role || user?.legacyRole || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  return [
    "admin",
    "superadmin",
    "administrator",
    "manager",
    "tourmanager",
    "guide",
    "tourguide",
    "agent",
    "travelagent",
  ].includes(role);
};

export const getBookingById = async (
req,
res,
next
)=>{

try{

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
return res.status(400).json({
success:false,
message:"Invalid booking ID"
});
}

const booking =

await Booking.findById(
req.params.id
)

.populate("tour")

.populate(
"customer",
"name email phone"
)

.populate(
"assignedGuide"
)

.populate(
"assignedDriver"
)

.populate(
"assignedVehicle"
)

.lean();



if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}

if (
  !isPrivilegedBookingViewer(req.user) &&
  booking.user?.toString() !== req.user._id.toString() &&
  booking.customer?.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    success: false,
    message: "You do not have access to this booking.",
  });
}





return successResponse(

res,

200,

"Booking retrieved successfully",

{
booking
}

);



}

catch(error){

next(error);

}


};



// Compatibility
export const getBooking =
getBookingById;






/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
|
| Used by:
| - M-Pesa callback
| - Card payment
| - Bank payment
|
|--------------------------------------------------------------------------
*/

export const updateBookingPayment = async (

bookingId,

paymentStatus,

paymentData={}

)=>{


if(
!PAYMENT_STATUSES.includes(paymentStatus)
){

throw new Error(
"Invalid payment status"
);

}



const booking =
await Booking.findById(
bookingId
);



if(!booking){

throw new Error(
"Booking not found"
);

}




// Prevent duplicate processing

if(
booking.paymentStatus==="paid" &&
paymentStatus==="paid"
){

return booking;

}



booking.paymentStatus =
paymentStatus;



/*
|--------------------------------------------------------------------------
| PAID
|--------------------------------------------------------------------------
*/

if(paymentStatus==="paid"){


/*
|--------------------------------------------------------------------------
| CREATE AGENT COMMISSION
|--------------------------------------------------------------------------
*/

if(booking.agent){

const existingCommission =
await Commission.findOne({
booking:booking._id
});


if(!existingCommission){


const agent =
await Agent.findById(
booking.agent
);


if(agent){


const rate =
agent.commissionRate || 10;


const amount =
(
booking.totalAmount *
rate
) / 100;



await Commission.create({

agent:agent._id,

booking:booking._id,

customer:booking.customer,

tour:booking.tour,

bookingAmount:
booking.totalAmount,

rate,

amount,

status:"pending",

paymentMethod:
paymentData.paymentMethod || "MPESA",

paymentReference:
paymentData.mpesaReceiptNumber || ""

});



agent.totalCommission += amount;

agent.pendingCommission += amount;

agent.walletBalance += amount;

agent.totalSales += booking.totalAmount;

agent.totalBookings += 1;


await agent.save();


}

}

}



booking.status =
"confirmed";


booking.status =
"confirmed";



if(paymentData.mpesaReceiptNumber){

booking.mpesaReceipt =
paymentData.mpesaReceiptNumber;

}



if(paymentData.transactionId){

booking.transactionId =
paymentData.transactionId;

}



if(paymentData.paymentMethod){

booking.paymentMethod =
paymentData.paymentMethod;

}



booking.paidAt =
new Date();


}




/*
|--------------------------------------------------------------------------
| FAILED
|--------------------------------------------------------------------------
*/

if(paymentStatus==="failed"){

if(
booking.paymentStatus!=="paid"
){

booking.status =
"pending";


booking.status =
"pending";

}

}




/*
|--------------------------------------------------------------------------
| CANCELLED
|--------------------------------------------------------------------------
*/

if(paymentStatus==="cancelled"){

if(
booking.paymentStatus!=="paid"
){

booking.status =
"cancelled";


booking.status =
"cancelled";

}

}





/*
|--------------------------------------------------------------------------
| REFUNDED
|--------------------------------------------------------------------------
*/

if(paymentStatus==="refunded"){

booking.status =
"refunded";


booking.status =
"refunded";


booking.refundedAt =
new Date();

}



await booking.save();



return booking;

};






/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS ADMIN
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
req,
res,
next
)=>{


try{


const booking =
await Booking.findById(
req.params.id
);



if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}





if(req.body.status){


if(
!BOOKING_STATUSES.includes(
req.body.status
)
){

return res.status(400).json({

success:false,

message:"Invalid booking status"

});

}



booking.status =
req.body.status;

}





if(req.body.status){


if(
!BOOKING_STATUSES.includes(
req.body.status
)
){

return res.status(400).json({

success:false,

message:"Invalid booking status"

});

}


booking.status =
req.body.status;

}





if(req.body.paymentStatus){


if(
!PAYMENT_STATUSES.includes(
req.body.paymentStatus
)
){

return res.status(400).json({

success:false,

message:"Invalid payment status"

});

}


booking.paymentStatus =
req.body.paymentStatus;

}




if(
req.body.assigned !== undefined
){

booking.assigned =
req.body.assigned;

}





if(
booking.paymentStatus==="paid"
){

booking.status =
"confirmed";


booking.status =
"confirmed";


if(!booking.paidAt){

booking.paidAt =
new Date();

}

}





if(
booking.paymentStatus==="cancelled"
){

booking.status =
"cancelled";


booking.status =
"cancelled";

}




await booking.save();



return res.status(200).json({

success:true,

message:
"Booking updated successfully",

booking

});



}

catch(error){

next(error);

}

};







/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (
req,
res,
next
)=>{


try{

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
return res.status(400).json({
success:false,
message:"Invalid booking ID"
});
}

const booking =
await Booking.findById(
req.params.id
);



if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}




if (
  !isPrivilegedBookingViewer(req.user) &&
  booking.user?.toString() !== req.user._id.toString() &&
  booking.customer?.toString() !== req.user._id.toString()
) {
return res.status(403).json({
success:false,
message:"You do not have permission to cancel this booking"
});
}

if(
booking.status==="cancelled"
){

return res.status(400).json({

success:false,

message:
"Booking has already been cancelled"

});

}




if(
booking.status==="completed"
){

return res.status(400).json({

success:false,

message:
"Completed bookings cannot be cancelled"

});

}




booking.status =
"cancelled";


booking.status =
"cancelled";



if(
booking.paymentStatus!=="paid"
){

booking.paymentStatus =
"cancelled";

}




await releaseSlots(
booking.tour,
booking.numberOfGuests
);



booking.cancelledAt =
new Date();



await booking.save();



return res.status(200).json({

success:true,

message:
"Booking cancelled successfully",

booking

});



}

catch(error){

next(error);

}

};
