import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import mongoose from "mongoose";
import { getSystemSettings } from "../services/settingsService.js";

import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import SystemSetting from "../models/SystemSetting.js";
import { sendSMS } from "../services/smsService.js";
import { sendWhatsApp } from "../services/whatsappService.js";

import Tour from "../models/Tour.js";
import CustomTourRequest from "../models/CustomTourRequest.js";

import {
  reserveSlots,
  validateTourCapacity,
  releaseSlots,
} from "../services/inventoryService.js";

import {
  BOOKING_PAYMENT_STATUSES,
  BOOKING_STATUSES,
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

    const settings = await getSystemSettings();
    const companyName = settings.companyName || "Company";
  try {

      const {
        tour,
        customTourRequest,
        travelDate,
        travelers,
        numberOfGuests,
        contact,
        paymentMethod,
        pickupLocation,
        pickupTime,
        hotelName,
        roomNumber,
        emergencyContact,
        specialRequests,
      } = req.body;


      const totalTravellers =
        Number(numberOfGuests) ||
        travelers?.length ||
        1;


      let tourData = null;

      if (tour) {
        tourData = await Tour.findById(tour);
      }


      let customTourData = null;

      if (customTourRequest) {
        customTourData = await CustomTourRequest.findOne(mergeTenantFilter(req,{
          _id: customTourRequest,
          customer: req.user._id,
        });

        if (!customTourData) {
          return res.status(404).json({
            success: false,
            message: "Custom tour request not found.",
          });
        }

        if (!["approved", "quoted"].includes(customTourData.status)) {
          return res.status(409).json({
            success: false,
            message: "This custom tour has not been approved and quoted for booking.",
          });
        }

        if (!Number.isFinite(Number(customTourData.quotedAmount)) || Number(customTourData.quotedAmount) <= 0) {
          return res.status(409).json({
            success: false,
            message: "This custom tour does not have a valid server-approved quote.",
          });
        }
      }


      if (!tourData && !customTourData) {
        return res.status(404).json({
          success:false,
          message:"Tour or custom tour request not found"
        });
      }


      let capacityAvailable = true;

      if (tour) {
        capacityAvailable = await validateTourCapacity(
          tour,
          totalTravellers,
          travelDate
        );
      }

      if (!capacityAvailable) {
        return res.status(409).json({
          success: false,
          message: "Not enough available tour slots for this booking.",
        });
      }

    const amounts = tourData
      ? calculateBookingAmounts(
          tourData,
          totalTravellers
        )
      : {
          subtotal: Number(customTourData?.quotedAmount || customTourData?.budget || 0),
          discountAmount: 0,
          totalAmount: Number(customTourData?.quotedAmount || customTourData?.budget || 0),
          depositAmount: Number(customTourData?.quotedAmount || customTourData?.budget || 0),
          balanceAmount: 0,
        };

    // Reserve capacity before creating the booking. If booking creation
    // fails, the reservation is released in the catch block below.
      if (tour) {
        await reserveSlots(tour, totalTravellers);
      }

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


          tour: tour || null,

          customTourRequest: customTourRequest || null,
        travelDate,


        travelers,


        numberOfGuests:
          totalTravellers,


        contact,

        pickupLocation: String(pickupLocation || "").trim(),
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        hotelName: String(hotelName || "").trim(),
        roomNumber: String(roomNumber || "").trim(),
        emergencyContact: emergencyContact || undefined,
        specialRequests: Array.isArray(specialRequests)
          ? specialRequests.map((item) => String(item).trim()).filter(Boolean)
          : [],

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
      try {
        const admins = await User.find(mergeTenantFilter(req,{
          $or: [
            { role: { $in: ["admin", "superadmin", "super_admin", "manager", "tour_manager", "tourmanager"] } },
            { legacyRole: { $in: ["admin", "superadmin", "super_admin", "manager", "tour_manager", "tourmanager"] } },
          ],
          status: "active",
        }).select("_id").lean();

        if (admins.length) {
          await Notification.insertMany(admins.map((admin) => ({
            recipient: admin._id,
            user: admin._id,
            title: "New Booking",
            message: `New booking ${booking.bookingNumber || booking._id} is awaiting payment/confirmation.`,
            type: "booking",
            relatedModel: "Booking",
            relatedId: booking._id,
            actionUrl: `/admin/bookings`,
          })));
        }
      } catch (notificationError) {
        console.error("ADMIN BOOKING NOTIFICATION ERROR:", notificationError.message);
      }

    } catch (createError) {
      // Roll back the reserved capacity when booking creation fails.
        try {
          if (tour) {
            await releaseSlots(tour, totalTravellers);
          }
        } catch (releaseError) {
          console.error("BOOKING CAPACITY ROLLBACK ERROR:", releaseError);
        }
      throw createError;
    }

    // External notifications must never make a successful booking fail.
    const bookingTour = tourData || customTourData || {
      title: "Custom Tour Request"
    };

    const bookingTourTitle =
      tourData?.title ||
      customTourData?.destination ||
      "Custom Tour Request";
    const systemSettings = await SystemSetting.findOne(mergeTenantFilter(req,{ key: "default" }).lean().catch(() => null);
    const bookingNotificationsEnabled = systemSettings?.bookingNotifications !== false;
    const customerPhone =
      booking.contact?.phone ||
      booking.customerSnapshot?.phone ||
      req.user.phone ||
      "";
    const bookingMessage = [
      `${companyName} booking ${booking.bookingNumber}.`,
      `Tour: ${bookingTourTitle}.`,
      `Date: ${new Date(booking.travelDate).toLocaleDateString("en-KE")}.`,
      `Guests: ${booking.numberOfGuests}.`,
      pickupLocation ? `Pickup: ${pickupLocation}.` : "",
      pickupTime ? `Pickup time: ${new Date(pickupTime).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}.` : "",
      `Amount: KES ${Number(booking.totalAmount || 0).toLocaleString()}.`,
      `Thank you for choosing ${companyName}.`,
    ].filter(Boolean).join(" ");

    if (bookingNotificationsEnabled) {
      await Promise.allSettled([
        customerPhone ? sendSMS(customerPhone, bookingMessage) : Promise.resolve(),
        customerPhone ? sendWhatsApp({ to: customerPhone, message: bookingMessage }) : Promise.resolve(),
      ]);
    }

    // Keep a useful internal notification for the customer when the app is used.
    if (bookingNotificationsEnabled && req.user?._id) {
      await Notification.create({
        recipient: req.user._id,
        user: req.user._id,
        title: "Booking received",
        message: `Booking ${booking.bookingNumber} for ${bookingTourTitle} has been received.`,
        type: "booking",
        relatedModel: "Booking",
        relatedId: booking._id,
        actionUrl: `/bookings/${booking._id}`,
      }).catch((error) => console.error("CUSTOMER BOOKING NOTIFICATION ERROR:", error.message));
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


    const customerProfile = await Customer.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    })
      .select("_id")
      .lean();

    const ownershipFilters = [
      { user: req.user._id },
    ];

    if (customerProfile?._id) {
      ownershipFilters.push({
        customer: customerProfile._id,
      });
    }

    const filter = {
      $or: ownershipFilters,
    };


    const total =
      await Booking.countDocuments(filter);



    const bookings =
      await Booking.find(filter)

      .populate("tour")

      .populate("user", "name email phone")

      .populate("customer", "name email phone user")

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
"name email phone user"
)

.populate(
"user",
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
      paymentStatus: "paid",
      status: {
        $in: ["confirmed", "assigned", "ongoing"],
      },
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
"user",
"name email phone"
)

.populate(
"customer",
"name email phone user"
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

if (!isPrivilegedBookingViewer(req.user)) {
  const requesterId = req.user._id.toString();

  const ownsAsUser =
    booking.user?._id?.toString() === requesterId ||
    booking.user?.toString() === requesterId;

  const ownsThroughCustomer =
    booking.customer?.user?._id?.toString() === requesterId ||
    booking.customer?.user?.toString() === requesterId ||
    booking.customer?._id?.toString() === requesterId ||
    booking.customer?.toString() === requesterId;

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
!BOOKING_PAYMENT_STATUSES.includes(paymentStatus)
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
await Commission.findOne(mergeTenantFilter(req,{
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

tour:booking.tour || null,

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
!BOOKING_PAYMENT_STATUSES.includes(
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




if (booking.tour) {
  await releaseSlots(
    booking.tour,
    booking.numberOfGuests
  );
}



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


export const rescheduleBooking = async (req, res, next) => {
  try {
    const { newTravelDate, reason = "" } = req.body || {};
    if (!newTravelDate || Number.isNaN(new Date(newTravelDate).getTime())) return res.status(400).json({ success:false, message:"A valid future travel date is required." });
    const target = new Date(newTravelDate); target.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    if (target <= today) return res.status(400).json({ success:false, message:"The rescheduled date must be in the future." });
    const booking = await Booking.findOne(mergeTenantFilter(req,{ _id:req.params.id, $or:[{user:req.user._id},{"customerSnapshot.email":req.user.email}] });
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });
    if (["cancelled","completed","refunded"].includes(booking.status)) return res.status(400).json({ success:false, message:"This booking cannot be rescheduled." });
    if (booking.travelDate && target.getTime() === new Date(booking.travelDate).setHours(0,0,0,0)) return res.status(400).json({ success:false, message:"Choose a different travel date." });
    const previous = booking.travelDate;
    if (!booking.originalTravelDate) booking.originalTravelDate = previous;
    booking.travelDate = target;
    booking.rescheduleCount = Number(booking.rescheduleCount || 0) + 1;
    booking.rescheduleHistory.push({ fromDate: previous, toDate: target, reason:String(reason||"").trim() });
    await booking.save();
    await Notification.create({ recipient:req.user._id, user:req.user._id, title:"Booking Rescheduled", message:`Your booking ${booking.bookingNumber} has been rescheduled to ${target.toLocaleDateString("en-KE")}.`, type:"booking", relatedModel:"Booking", relatedId:booking._id, actionUrl:`/bookings/${booking._id}` });
    const admins = await User.find(mergeTenantFilter(req,{ $or:[{role:{$in:["admin","superadmin","super_admin","manager","tour_manager","tourmanager"]}},{legacyRole:{$in:["admin","superadmin","super_admin","manager","tour_manager","tourmanager"]}}], status:"active" }).select("_id").lean();
    if (admins.length) await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Booking Reschedule Requested",message:`${booking.bookingNumber} was moved to ${target.toLocaleDateString("en-KE")}.`,type:"booking",relatedModel:"Booking",relatedId:booking._id,actionUrl:"/admin/bookings"})));
    res.json({success:true,message:"Booking rescheduled successfully.",booking});
  } catch(error){ next(error); }
};
