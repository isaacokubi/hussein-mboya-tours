/**
 * Purpose: booking Controller HTTP controller. Main declarations: createBooking, getMyBookings, getAllBookings, getConfirmedBookings, isPrivilegedBookingViewer.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";

// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../services/smsService.js so this module can use its exported dependencies.
import { sendSMS } from "../services/smsService.js";
// Load ../services/whatsappService.js so this module can use its exported dependencies.
import { sendWhatsApp } from "../services/whatsappService.js";

// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/CustomTourRequest.js so this module can use its exported dependencies.
import CustomTourRequest from "../models/CustomTourRequest.js";

// Load ../services/inventoryService.js so this module can use its exported dependencies.
import {
  reserveSlots,
  validateTourCapacity,
  releaseSlots,
} from "../services/inventoryService.js";

// Load ../constants/bookingConstants.js so this module can use its exported dependencies.
import {
  BOOKING_PAYMENT_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  canTransitionBookingStatus,
  isValidBookingStatus,
} from "../constants/bookingConstants.js";

// Load ../utils/bookingPricing.js so this module can use its exported dependencies.
import { calculateBookingAmounts } from "../utils/bookingPricing.js";
// Load ../services/taxEngineService.js so this module can use its exported dependencies.
import { calculateTax } from "../services/taxEngineService.js";
// Load ../services/bookingCreationService.js so this module can use its exported dependencies.
import { createBookingAtomically } from "../services/bookingCreationService.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
// Load ../services/emailService.js so this module can use its exported dependencies.
import { sendBookingConfirmationEmail, sendEmailBestEffort } from "../services/emailService.js";

// Load ../utils/apiResponse.js so this module can use its exported dependencies.
import { successResponse } from "../utils/apiResponse.js";


/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

// Declare createBooking for use by the surrounding module or function.
export const createBooking = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

    // Declare settings for use by the surrounding module or function.
    const settings = await getSystemSettings();
    // Declare companyName for use by the surrounding module or function.
    const companyName = settings.companyName || "Company";
  // Run this operation with a dedicated error-handling path for failures.
  try {

      // Declare { tour, customTourRequest, travelDate, travelers, numberOfGuests, contact, paymentMethod, pickupLocation, pickupTime, hotelName, roomNumber, emergencyContact, specialRequests, } for use by the surrounding module or function.
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


      // Declare totalTravellers for use by the surrounding module or function.
      const totalTravellers =
        Number(numberOfGuests) ||
        travelers?.length ||
        1;


      // Declare tourData for use by the surrounding module or function.
      let tourData = null;

      // Check the condition (tour) and run the matching branch.
      if (tour) {
        // Perform the side effect or state update expressed on the following line.
        tourData = await Tour.findOne(
          mergeTenantFilter({
            _id: tour,
          })
        );
      }


      // Declare customTourData for use by the surrounding module or function.
      let customTourData = null;

      // Check the condition (customTourRequest) and run the matching branch.
      if (customTourRequest) {
        // Perform the side effect or state update expressed on the following line.
        customTourData = await CustomTourRequest.findOne(
          mergeTenantFilter({
            _id: customTourRequest,
            customer: req.user._id,
          })
        );

        // Check the condition (!customTourData) and run the matching branch.
        if (!customTourData) {
          // Return the result of res.status(404).json() to the caller.
          return res.status(404).json({
            success: false,
            message: "Custom tour request not found.",
          });
        }

        // Check the condition (!["approved", "quoted"].includes(customTourData.status)) and run the matching branch.
        if (!["approved", "quoted"].includes(customTourData.status)) {
          // Return the result of res.status(409).json() to the caller.
          return res.status(409).json({
            success: false,
            message: "This custom tour has not been approved and quoted for booking.",
          });
        }

        // Check the condition (!Number.isFinite(Number(customTourData.quotedAmount)) || Number(custom) and run the matching branch.
        if (!Number.isFinite(Number(customTourData.quotedAmount)) || Number(customTourData.quotedAmount) <= 0) {
          // Return the result of res.status(409).json() to the caller.
          return res.status(409).json({
            success: false,
            message: "This custom tour does not have a valid server-approved quote.",
          });
        }
      }


      // Check the condition (!tourData && !customTourData) and run the matching branch.
      if (!tourData && !customTourData) {
        // Return the result of res.status(404).json() to the caller.
        return res.status(404).json({
          success:false,
          message:"Tour or custom tour request not found"
        });
      }


      // Declare capacityAvailable for use by the surrounding module or function.
      let capacityAvailable = true;

      // Check the condition (tour) and run the matching branch.
      if (tour) {
        // Perform the side effect or state update expressed on the following line.
        capacityAvailable = await validateTourCapacity(
          tour,
          totalTravellers,
          travelDate
        );
      }

      // Check the condition (!capacityAvailable) and run the matching branch.
      if (!capacityAvailable) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({
          success: false,
          message: "Not enough available tour slots for this booking.",
        });
      }

    // Declare amounts for use by the surrounding module or function.
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

    // Check the condition (tourData?.taxEnabled) and run the matching branch.
    if (tourData?.taxEnabled) {
      // Declare tax for use by the surrounding module or function.
      const tax = calculateTax({
        amount: amounts.subtotal,
        discount: amounts.discountAmount,
        category: tourData.taxCategory || "STANDARD",
        rate: tourData.taxRate,
        mode: tourData.taxMode || "exclusive",
      });
      // Perform the side effect or state update expressed on the following line.
      amounts.taxAmount = tax.taxAmount;
      // Perform the side effect or state update expressed on the following line.
      amounts.serviceFee = 0;
      // Perform the side effect or state update expressed on the following line.
      amounts.totalAmount = tax.totalAmount;
      // Perform the side effect or state update expressed on the following line.
      amounts.balanceAmount = tax.totalAmount;
    } else {
      // Perform the side effect or state update expressed on the following line.
      amounts.taxAmount = 0;
      // Perform the side effect or state update expressed on the following line.
      amounts.serviceFee = 0;
    }

    // Declare customerProfile for use by the surrounding module or function.
    const customerProfile = await Customer.findOne(
      mergeTenantFilter({ user: req.user._id })
    );

    // Declare bookingData for use by the surrounding module or function.
    const bookingData = {
      customer: customerProfile?._id || null,
      user: req.user._id,
      customerSnapshot: {
        name: req.user.name || "",
        email: req.user.email || "",
        phone: req.user.phone || "",
      },
      tour: tour || null,
      customTourRequest: customTourRequest || null,
      travelDate,
      travelers,
      numberOfGuests: totalTravellers,
      contact,
      pickupLocation: String(pickupLocation || "").trim(),
      pickupTime: pickupTime ? new Date(pickupTime) : null,
      hotelName: String(hotelName || "").trim(),
      roomNumber: String(roomNumber || "").trim(),
      emergencyContact: emergencyContact || undefined,
      specialRequests: Array.isArray(specialRequests)
        ? specialRequests.map((item) => String(item).trim()).filter(Boolean)
        : [],
      subtotal: amounts.subtotal,
      discountAmount: amounts.discountAmount,
      taxAmount: Number(amounts.taxAmount || 0),
      serviceFee: Number(amounts.serviceFee || 0),
      totalAmount: amounts.totalAmount,
      depositAmount: amounts.depositAmount,
      amountPaid: 0,
      balanceAmount: amounts.totalAmount,
      paymentMethod: paymentMethod || PAYMENT_METHODS.MPESA,
      paymentStatus: "pending",
      status: "pending",
      assigned: false,
    };

    // Declare booking for use by the surrounding module or function.
    const booking = await createBookingAtomically({
      tourId: tour || null,
      travelers: totalTravellers,
      travelDate,
      bookingData,
    });

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = booking.tenantId;
      // Check the condition (tenantId) and run the matching branch.
      if (tenantId) {
        // Perform the side effect or state update expressed on the following line.
        await queueWebhookEvent({
          tenantId,
          event: "booking.created",
          sourceId: String(booking._id),
          data: {
            id: booking._id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            travelDate: booking.travelDate,
            numberOfGuests: booking.numberOfGuests,
            totalAmount: booking.totalAmount,
            currency: "KES",
          },
        });
      }
    } catch (queueError) {
      // Perform the side effect or state update expressed on the following line.
      console.error("BOOKING WEBHOOK QUEUE ERROR:", queueError.message);
    }

    // External notifications must never make a successful booking fail.
    // Declare bookingTour for use by the surrounding module or function.
    const bookingTour = tourData || customTourData || {
      title: "Custom Tour Request"
    };

    // Declare bookingTourTitle for use by the surrounding module or function.
    const bookingTourTitle =
      tourData?.title ||
      customTourData?.destination ||
      "Custom Tour Request";
    // Declare systemSettings for use by the surrounding module or function.
    const systemSettings = await getSystemSettings({
        req,
        tenantId: req.tenantId || req.user?.tenantId || null,
      });
    // Declare bookingNotificationsEnabled for use by the surrounding module or function.
    const bookingNotificationsEnabled = systemSettings?.bookingNotifications !== false;
    // Declare customerPhone for use by the surrounding module or function.
    const customerPhone =
      booking.contact?.phone ||
      booking.customerSnapshot?.phone ||
      req.user.phone ||
      "";
    // Declare bookingMessage for use by the surrounding module or function.
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

    // Check the condition (bookingNotificationsEnabled) and run the matching branch.
    if (bookingNotificationsEnabled) {
      // Perform the side effect or state update expressed on the following line.
      await Promise.allSettled([
        sendEmailBestEffort(() => sendBookingConfirmationEmail(booking), "Booking confirmation"),
        customerPhone ? sendSMS(customerPhone, bookingMessage) : Promise.resolve(),
        customerPhone ? sendWhatsApp({ to: customerPhone, message: bookingMessage }) : Promise.resolve(),
      ]);
    }

    // Keep a useful internal notification for the customer when the app is used.
    // Check the condition (bookingNotificationsEnabled && req.user?._id) and run the matching branch.
    if (bookingNotificationsEnabled && req.user?._id) {
      // Perform the side effect or state update expressed on the following line.
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

    // Return the result of successResponse() to the caller.
    return successResponse(
      res,
      201,
      "Booking created successfully",
      {
        booking
      }
    );


  } catch(error){

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};



/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

// Declare getMyBookings for use by the surrounding module or function.
export const getMyBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare page for use by the surrounding module or function.
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));


    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));


    // Declare skip for use by the surrounding module or function.
    const skip =
      (page - 1) * limit;


    // Declare customerProfile for use by the surrounding module or function.
    const customerProfile = await Customer.findOne(
      mergeTenantFilter({
        user: req.user._id,
      })
    )
      .select("_id")
      .lean();

    // Declare ownershipFilters for use by the surrounding module or function.
    const ownershipFilters = [
      { user: req.user._id },
    ];

    // Check the condition (customerProfile?._id) and run the matching branch.
    if (customerProfile?._id) {
      // Perform the side effect or state update expressed on the following line.
      ownershipFilters.push({
        customer: customerProfile._id,
      });
    }

    // Declare filter for use by the surrounding module or function.
    const filter = {
      $or: ownershipFilters,
    };


    // Declare total for use by the surrounding module or function.
    const total =
      await Booking.countDocuments(filter);



    // Declare bookings for use by the surrounding module or function.
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



    // Return the result of successResponse() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};



/*
|--------------------------------------------------------------------------
| ADMIN GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/

// Declare getAllBookings for use by the surrounding module or function.
export const getAllBookings = async (req,res,next)=>{

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare { status, paymentStatus, search } for use by the surrounding module or function.
const {
status,
paymentStatus,
search
}=req.query;


// Declare page for use by the surrounding module or function.
const page = Math.max(1, Math.floor(Number(req.query.page) || 1));


// Declare limit for use by the surrounding module or function.
const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));


// Declare skip for use by the surrounding module or function.
const skip =
(page-1)*limit;


// Declare filter for use by the surrounding module or function.
const filter={};



// Check the condition (status) and run the matching branch.
if(status){
// Perform the side effect or state update expressed on the following line.
filter.status=status;
}



// Check the condition (paymentStatus) and run the matching branch.
if(paymentStatus){
// Perform the side effect or state update expressed on the following line.
filter.paymentStatus=paymentStatus;
}



// Check the condition (search) and run the matching branch.
if(search){

// Perform the side effect or state update expressed on the following line.
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



// Declare total for use by the surrounding module or function.
const total =
await Booking.countDocuments(filter);



// Declare bookings for use by the surrounding module or function.
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



// Return the result of res.status(200).json() to the caller.
return res.status(200).json({

success:true,

page,

pages:Math.ceil(total/limit),

total,

count:bookings.length,

bookings

});


}
// Handle the error raised by the preceding protected operation.
catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};



// Declare getBookings for use by the surrounding module or function.
export const getBookings =
getAllBookings; /*
|--------------------------------------------------------------------------
| GET CONFIRMED BOOKINGS FOR TOUR MANAGER
|--------------------------------------------------------------------------
*/

// Declare getConfirmedBookings for use by the surrounding module or function.
export const getConfirmedBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare page for use by the surrounding module or function.
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));


    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));


    // Declare skip for use by the surrounding module or function.
    const skip =
      (page - 1) * limit;



    // Declare filter for use by the surrounding module or function.
    const filter = {
      paymentStatus: "paid",
      status: {
        $in: ["confirmed", "assigned", "ongoing"],
      },
    };



    // Declare total for use by the surrounding module or function.
    const total =
      await Booking.countDocuments(filter);



    // Declare bookings for use by the surrounding module or function.
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



    // Return the result of res.status(200).json() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }
};




/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

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

// Declare getBookingById for use by the surrounding module or function.
export const getBookingById = async (
req,
res,
next
)=>{

// Run this operation with a dedicated error-handling path for failures.
try{

// Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// Return the result of res.status(400).json() to the caller.
return res.status(400).json({
success:false,
message:"Invalid booking ID"
});
}

// Declare booking for use by the surrounding module or function.
const booking =

await Booking.findOne(
mergeTenantFilter({
  _id: req.params.id,
})
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



// Check the condition (!booking) and run the matching branch.
if(!booking){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({

success:false,

message:"Booking not found"

});

}

// Check the condition (!isPrivilegedBookingViewer(req.user)) and run the matching branch.
if (!isPrivilegedBookingViewer(req.user)) {
  // Declare requesterId for use by the surrounding module or function.
  const requesterId = req.user._id.toString();

  // Declare ownsAsUser for use by the surrounding module or function.
  const ownsAsUser =
    booking.user?._id?.toString() === requesterId ||
    booking.user?.toString() === requesterId;

  // Declare ownsThroughCustomer for use by the surrounding module or function.
  const ownsThroughCustomer =
    booking.customer?.user?._id?.toString() === requesterId ||
    booking.customer?.user?.toString() === requesterId ||
    booking.customer?._id?.toString() === requesterId ||
    booking.customer?.toString() === requesterId;

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

{
booking
}

);



}

// Handle the error raised by the preceding protected operation.
catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}


};



// Compatibility
// Declare getBooking for use by the surrounding module or function.
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

// Declare updateBookingPayment for use by the surrounding module or function.
export const updateBookingPayment = async (

bookingId,

paymentStatus,

paymentData={}

)=>{


// Check the condition (!BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) and run the matching branch.
if(
!BOOKING_PAYMENT_STATUSES.includes(paymentStatus)
){

// Stop the current operation by raising a new Error instance.
throw new Error(
"Invalid payment status"
);

}



// Declare booking for use by the surrounding module or function.
const booking =
await Booking.findOne(
mergeTenantFilter({
  _id: bookingId,
})
);



// Check the condition (!booking) and run the matching branch.
if(!booking){

// Stop the current operation by raising a new Error instance.
throw new Error(
"Booking not found"
);

}




// Prevent duplicate processing

// Check the condition (booking.paymentStatus==="paid" && paymentStatus==="paid") and run the matching branch.
if(
booking.paymentStatus==="paid" &&
paymentStatus==="paid"
){

// Return the value of booking to the caller.
return booking;

}



// Perform the side effect or state update expressed on the following line.
booking.paymentStatus =
paymentStatus;

// Check the condition (paymentStatus === "paid") and run the matching branch.
if (paymentStatus === "paid") {
  // Declare paymentAmount for use by the surrounding module or function.
  const paymentAmount = Number(paymentData?.amount || 0);
  // Perform the side effect or state update expressed on the following line.
  booking.amountPaid = Math.min(
    Number(booking.totalAmount || 0),
    Number(booking.amountPaid || 0) + (paymentAmount > 0 ? paymentAmount : Number(booking.totalAmount || 0))
  );
  // Perform the side effect or state update expressed on the following line.
  booking.balanceAmount = Math.max(0, Number(booking.totalAmount || 0) - booking.amountPaid);
} else if (paymentStatus === "partial" && Number(paymentData?.amount || 0) > 0) {
  // Perform the side effect or state update expressed on the following line.
  booking.amountPaid = Math.min(
    Number(booking.totalAmount || 0),
    Number(booking.amountPaid || 0) + Number(paymentData.amount)
  );
  // Perform the side effect or state update expressed on the following line.
  booking.balanceAmount = Math.max(0, Number(booking.totalAmount || 0) - booking.amountPaid);
}



/*
|--------------------------------------------------------------------------
| PAID
|--------------------------------------------------------------------------
*/

// Check the condition (paymentStatus==="paid") and run the matching branch.
if(paymentStatus==="paid"){


/*
|--------------------------------------------------------------------------
| CREATE AGENT COMMISSION
|--------------------------------------------------------------------------
*/

// Check the condition (booking.agent) and run the matching branch.
if(booking.agent){

// Declare existingCommission for use by the surrounding module or function.
const existingCommission =
await Commission.findOne({
booking:booking._id
});


// Check the condition (!existingCommission) and run the matching branch.
if(!existingCommission){


// Declare agent for use by the surrounding module or function.
const agent =
await Agent.findById(
booking.agent
);


// Check the condition (agent) and run the matching branch.
if(agent){


// Declare rate for use by the surrounding module or function.
const rate =
agent.commissionRate || 10;


// Declare amount for use by the surrounding module or function.
const amount =
(
booking.totalAmount *
rate
) / 100;



// Perform the side effect or state update expressed on the following line.
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



// Perform the side effect or state update expressed on the following line.
agent.totalCommission += amount;

// Perform the side effect or state update expressed on the following line.
agent.pendingCommission += amount;

// Perform the side effect or state update expressed on the following line.
agent.walletBalance += amount;

// Perform the side effect or state update expressed on the following line.
agent.totalSales += booking.totalAmount;

// Perform the side effect or state update expressed on the following line.
agent.totalBookings += 1;


// Perform the side effect or state update expressed on the following line.
await agent.save();


}

}

}



// Perform the side effect or state update expressed on the following line.
booking.status =
"confirmed";


// Perform the side effect or state update expressed on the following line.
booking.status =
"confirmed";



// Check the condition (paymentData.mpesaReceiptNumber) and run the matching branch.
if(paymentData.mpesaReceiptNumber){

// Perform the side effect or state update expressed on the following line.
booking.mpesaReceipt =
paymentData.mpesaReceiptNumber;

}



// Check the condition (paymentData.transactionId) and run the matching branch.
if(paymentData.transactionId){

// Perform the side effect or state update expressed on the following line.
booking.transactionId =
paymentData.transactionId;

}



// Check the condition (paymentData.paymentMethod) and run the matching branch.
if(paymentData.paymentMethod){

// Perform the side effect or state update expressed on the following line.
booking.paymentMethod =
paymentData.paymentMethod;

}



// Perform the side effect or state update expressed on the following line.
booking.paidAt =
new Date();


}




/*
|--------------------------------------------------------------------------
| FAILED
|--------------------------------------------------------------------------
*/

// Check the condition (paymentStatus==="failed") and run the matching branch.
if(paymentStatus==="failed"){

// Check the condition (booking.paymentStatus!=="paid") and run the matching branch.
if(
booking.paymentStatus!=="paid"
){

// Perform the side effect or state update expressed on the following line.
booking.status =
"pending";


// Perform the side effect or state update expressed on the following line.
booking.status =
"pending";

}

}




/*
|--------------------------------------------------------------------------
| CANCELLED
|--------------------------------------------------------------------------
*/

// Check the condition (paymentStatus==="cancelled") and run the matching branch.
if(paymentStatus==="cancelled"){

// Check the condition (booking.paymentStatus!=="paid") and run the matching branch.
if(
booking.paymentStatus!=="paid"
){

// Perform the side effect or state update expressed on the following line.
booking.status =
"cancelled";


// Perform the side effect or state update expressed on the following line.
booking.status =
"cancelled";

}

}





/*
|--------------------------------------------------------------------------
| REFUNDED
|--------------------------------------------------------------------------
*/

// Check the condition (paymentStatus==="refunded") and run the matching branch.
if(paymentStatus==="refunded"){

// Perform the side effect or state update expressed on the following line.
booking.status =
"refunded";


// Perform the side effect or state update expressed on the following line.
booking.status =
"refunded";


// Perform the side effect or state update expressed on the following line.
booking.refundedAt =
new Date();

}



// Perform the side effect or state update expressed on the following line.
await booking.save();



// Return the value of booking to the caller.
return booking;

};






/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS ADMIN
|--------------------------------------------------------------------------
*/

// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter({ _id: req.params.id })
    );

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Declare requestedStatus for use by the surrounding module or function.
    const requestedStatus = String(req.body?.status || "").trim().toLowerCase();
    // Check the condition (!isValidBookingStatus(requestedStatus)) and run the matching branch.
    if (!isValidBookingStatus(requestedStatus)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
        allowedStatuses: BOOKING_STATUSES,
      });
    }

    // Check the condition (requestedStatus === booking.status) and run the matching branch.
    if (requestedStatus === booking.status) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Booking is already ${requestedStatus}.`,
      });
    }

    // Check the condition (!canTransitionBookingStatus(booking.status, requestedStatus)) and run the matching branch.
    if (!canTransitionBookingStatus(booking.status, requestedStatus)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        message: `Booking cannot transition from "${booking.status}" to "${requestedStatus}".`,
        currentStatus: booking.status,
        requestedStatus,
      });
    }

    // Check the condition (requestedStatus === "completed" && booking.paymentStatus !== "paid") and run the matching branch.
    if (requestedStatus === "completed" && booking.paymentStatus !== "paid") {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        code: "PAYMENT_REQUIRED_BEFORE_COMPLETION",
        message: "Only fully paid bookings can be moved into an active or completed trip state.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    booking.status = requestedStatus;
    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

// Declare cancelBooking for use by the surrounding module or function.
export const cancelBooking = async (
req,
res,
next
)=>{


// Run this operation with a dedicated error-handling path for failures.
try{

// Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// Return the result of res.status(400).json() to the caller.
return res.status(400).json({
success:false,
message:"Invalid booking ID"
});
}

// Declare booking for use by the surrounding module or function.
const booking =
await Booking.findOne(
mergeTenantFilter({
  _id: req.params.id,
})
);



// Check the condition (!booking) and run the matching branch.
if(!booking){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({

success:false,

message:"Booking not found"

});

}




// Check the condition (!isPrivilegedBookingViewer(req.user) && booking.user?.toString() !== r) and run the matching branch.
if (
  !isPrivilegedBookingViewer(req.user) &&
  booking.user?.toString() !== req.user._id.toString() &&
  booking.customer?.toString() !== req.user._id.toString()
) {
// Return the result of res.status(403).json() to the caller.
return res.status(403).json({
success:false,
message:"You do not have permission to cancel this booking"
});
}

// Check the condition (booking.status==="cancelled") and run the matching branch.
if(
booking.status==="cancelled"
){

// Return the result of res.status(400).json() to the caller.
return res.status(400).json({

success:false,

message:
"Booking has already been cancelled"

});

}




// Check the condition (booking.status==="completed") and run the matching branch.
if(
booking.status==="completed"
){

// Return the result of res.status(400).json() to the caller.
return res.status(400).json({

success:false,

message:
"Completed bookings cannot be cancelled"

});

}




// Perform the side effect or state update expressed on the following line.
booking.status =
"cancelled";


// Perform the side effect or state update expressed on the following line.
booking.status =
"cancelled";



// Check the condition (booking.paymentStatus!=="paid") and run the matching branch.
if(
booking.paymentStatus!=="paid"
){

// Perform the side effect or state update expressed on the following line.
booking.paymentStatus =
"cancelled";

}




// Check the condition (booking.tour) and run the matching branch.
if (booking.tour) {
  // Perform the side effect or state update expressed on the following line.
  await releaseSlots(
    booking.tour,
    booking.numberOfGuests,
    booking.travelDate
  );
}



// Perform the side effect or state update expressed on the following line.
booking.cancelledAt =
new Date();



// Perform the side effect or state update expressed on the following line.
await booking.save();



// Return the result of res.status(200).json() to the caller.
return res.status(200).json({

success:true,

message:
"Booking cancelled successfully",

booking

});



}

// Handle the error raised by the preceding protected operation.
catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};


// Declare getAllowedTourRange for use by the surrounding module or function.
const getAllowedTourRange = async (booking) => {
  // Check the condition (!booking.tour) and run the matching branch.
  if (!booking.tour) return null;
  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour }))
    .select("startDate endDate date durationDetails duration")
    .lean();
  // Check the condition (!tour) and run the matching branch.
  if (!tour) return null;
  // Declare start for use by the surrounding module or function.
  const start = new Date(tour.startDate || tour.date);
  // Check the condition (Number.isNaN(start.getTime())) and run the matching branch.
  if (Number.isNaN(start.getTime())) return null;
  // Perform the side effect or state update expressed on the following line.
  start.setHours(0, 0, 0, 0);
  // Declare storedEnd for use by the surrounding module or function.
  const storedEnd = tour.endDate ? new Date(tour.endDate) : null;
  // Check the condition (storedEnd && !Number.isNaN(storedEnd.getTime())) and run the matching branch.
  if (storedEnd && !Number.isNaN(storedEnd.getTime())) storedEnd.setHours(0, 0, 0, 0);
  // Declare match for use by the surrounding module or function.
  const match = String(tour.durationDetails?.days ?? tour.duration ?? 1).match(/\d+(?:\.\d+)?/);
  // Declare days for use by the surrounding module or function.
  const days = Math.max(1, Math.round(Number(match?.[0] || 1)));
  // Declare calculatedEnd for use by the surrounding module or function.
  const calculatedEnd = new Date(start);
  // Perform the side effect or state update expressed on the following line.
  calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
  // Declare end for use by the surrounding module or function.
  const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;
  // Return the object assembled below to the caller.
  return { start, end };
};

// Declare rescheduleBooking for use by the surrounding module or function.
export const rescheduleBooking = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { newTravelDate, reason = "" } for use by the surrounding module or function.
    const { newTravelDate, reason = "" } = req.body || {};
    // Check the condition (!newTravelDate || Number.isNaN(new Date(newTravelDate).getTime())) and run the matching branch.
    if (!newTravelDate || Number.isNaN(new Date(newTravelDate).getTime())) return res.status(400).json({ success:false, message:"A valid future travel date is required." });
    // Declare target for use by the surrounding module or function.
    const target = new Date(newTravelDate); target.setHours(0,0,0,0);
    // Declare today for use by the surrounding module or function.
    const today = new Date(); today.setHours(0,0,0,0);
    // Check the condition (target <= today) and run the matching branch.
    if (target <= today) return res.status(400).json({ success:false, message:"The rescheduled date must be in the future." });
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter({
        _id: req.params.id,
        $or: [
          { user: req.user._id },
          { "customerSnapshot.email": req.user.email },
        ],
      })
    );
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });
    // Check the condition (["cancelled","completed","refunded"].includes(booking.status)) and run the matching branch.
    if (["cancelled","completed","refunded"].includes(booking.status)) return res.status(400).json({ success:false, message:"This booking cannot be rescheduled." });
    // Check the condition (booking.travelDate && target.getTime() === new Date(booking.travelDate) and run the matching branch.
    if (booking.travelDate && target.getTime() === new Date(booking.travelDate).setHours(0,0,0,0)) return res.status(400).json({ success:false, message:"Choose a different travel date." });
    // Declare allowedRange for use by the surrounding module or function.
    const allowedRange = await getAllowedTourRange(booking);
    // Check the condition (booking.tour && (!allowedRange?.start || !allowedRange?.end)) and run the matching branch.
    if (booking.tour && (!allowedRange?.start || !allowedRange?.end)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success:false, message:"This tour has no configured travel-date range." });
    }
    // Check the condition (allowedRange && (target < allowedRange.start || target > allowedRange.) and run the matching branch.
    if (allowedRange && (target < allowedRange.start || target > allowedRange.end)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success:false,
        message:`Travel date must be between ${allowedRange.start.toLocaleDateString("en-KE")} and ${allowedRange.end.toLocaleDateString("en-KE")} for this tour.`,
      });
    }
    // Declare previous for use by the surrounding module or function.
    const previous = booking.travelDate;
    // Check the condition (!booking.originalTravelDate) and run the matching branch.
    if (!booking.originalTravelDate) booking.originalTravelDate = previous;
    // Perform the side effect or state update expressed on the following line.
    booking.travelDate = target;
    // Check the condition (booking.pickupTime) and run the matching branch.
    if (booking.pickupTime) {
      // Declare pickup for use by the surrounding module or function.
      const pickup = new Date(booking.pickupTime);
      // Check the condition (!Number.isNaN(pickup.getTime())) and run the matching branch.
      if (!Number.isNaN(pickup.getTime())) {
        // Declare updatedPickup for use by the surrounding module or function.
        const updatedPickup = new Date(target);
        // Perform the side effect or state update expressed on the following line.
        updatedPickup.setHours(pickup.getHours(), pickup.getMinutes(), pickup.getSeconds(), pickup.getMilliseconds());
        // Perform the side effect or state update expressed on the following line.
        booking.pickupTime = updatedPickup;
      }
    }
    // Perform the side effect or state update expressed on the following line.
    booking.rescheduleCount = Number(booking.rescheduleCount || 0) + 1;
    // Perform the side effect or state update expressed on the following line.
    booking.rescheduleHistory.push({ fromDate: previous, toDate: target, reason:String(reason||"").trim() });
    // Perform the side effect or state update expressed on the following line.
    await booking.save();
    // Perform the side effect or state update expressed on the following line.
    await Notification.create({ recipient:req.user._id, user:req.user._id, title:"Booking Rescheduled", message:`Your booking ${booking.bookingNumber} has been rescheduled to ${target.toLocaleDateString("en-KE")}.`, type:"booking", relatedModel:"Booking", relatedId:booking._id, actionUrl:`/bookings/${booking._id}` });
    // Declare admins for use by the surrounding module or function.
    const admins = await User.find(
      mergeTenantFilter({
        $or: [
          { role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
          { legacyRole: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } },
        ],
        status: "active",
      })
    ).select("_id").lean();
    // Check the condition (admins.length) and run the matching branch.
    if (admins.length) await Notification.insertMany(admins.map(a=>({recipient:a._id,user:a._id,title:"Booking Reschedule Requested",message:`${booking.bookingNumber} was moved to ${target.toLocaleDateString("en-KE")}.`,type:"booking",relatedModel:"Booking",relatedId:booking._id,actionUrl:"/admin/bookings"})));
    // Perform the side effect or state update expressed on the following line.
    res.json({success:true,message:"Booking rescheduled successfully.",booking});
  } catch(error){ next(error); }
};
