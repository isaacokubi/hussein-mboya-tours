/**
 * Purpose: admin AITour Pricing Controller HTTP controller. Main declarations: getTourPricingAdvice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";



// Declare getTourPricingAdvice for use by the surrounding module or function.
export const getTourPricingAdvice = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare tours for use by the surrounding module or function.
const tours =
await Tour.find(tenantFilter(req))
.select(
"title price"
)
.lean();



// Declare bookingStats for use by the surrounding module or function.
const bookingStats =
await Booking.aggregate([

{
$group:{
_id:"$tour",
bookings:{
$sum:1
}
}
}

]);



// Declare recommendations for use by the surrounding module or function.
const recommendations =
tours.map(tour=>{


// Declare stats for use by the surrounding module or function.
const stats =
bookingStats.find(
item =>
String(item._id) ===
String(tour._id)
);



// Declare bookings for use by the surrounding module or function.
const bookings =
stats?.bookings || 0;



// Declare action for use by the surrounding module or function.
let action="Maintain current price";

// Declare reason for use by the surrounding module or function.
let reason=
"Tour performance is stable.";



// Check the condition (bookings >= 10) and run the matching branch.
if(bookings >= 10){

// Perform the side effect or state update expressed on the following line.
action="Consider increasing price";

// Perform the side effect or state update expressed on the following line.
reason=
"High demand detected. Increase pricing gradually.";

}



// Check the condition (bookings <= 2) and run the matching branch.
if(bookings <= 2){

// Perform the side effect or state update expressed on the following line.
action="Create promotion";

// Perform the side effect or state update expressed on the following line.
reason=
"Low booking activity detected. Consider discounts or marketing.";

}



// Return the object assembled below to the caller.
return {

tourId:tour._id,

tour:tour.title,

currentPrice:
tour.price || 0,

bookings,

action,

reason

};


});



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:recommendations

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
