/**
 * Purpose: admin AIOperations Controller HTTP controller. Main declarations: getAIOperationsCenter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";


// Declare getAIOperationsCenter for use by the surrounding module or function.
export const getAIOperationsCenter = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare [ totalBookings, pendingBookings, confirmedBookings, revenue, vehicles, tours, reviews ] for use by the surrounding module or function.
const [

totalBookings,

pendingBookings,

confirmedBookings,

revenue,

vehicles,

tours,

reviews

]=await Promise.all([


Booking.countDocuments(),


Booking.countDocuments({
status:"pending"
}),


Booking.countDocuments({
status:"confirmed"
}),


Payment.aggregate([
{
$match:{
status:"completed"
}
},
{
$group:{
_id:null,
total:{
$sum:"$amount"
}
}
}
]),


Vehicle.countDocuments({
availability:"available"
}),


Tour.countDocuments(),


Review.aggregate([
{
$group:{
_id:null,
average:{
$avg:"$rating"
}
}
}

])

]);



// Declare rating for use by the surrounding module or function.
const rating =
reviews[0]?.average
?
Number(
reviews[0].average.toFixed(1)
)
:
0;



// Declare alerts for use by the surrounding module or function.
const alerts=[];



// Check the condition (pendingBookings > 10) and run the matching branch.
if(pendingBookings > 10){

// Perform the side effect or state update expressed on the following line.
alerts.push({

priority:"high",

title:"Booking backlog",

message:
`${pendingBookings} bookings require attention.`

});

}



// Check the condition (vehicles < 3) and run the matching branch.
if(vehicles < 3){

// Perform the side effect or state update expressed on the following line.
alerts.push({

priority:"medium",

title:"Vehicle availability",

message:
"Vehicle capacity may affect upcoming tours."

});

}



// Check the condition (rating < 4) and run the matching branch.
if(rating < 4){

// Perform the side effect or state update expressed on the following line.
alerts.push({

priority:"medium",

title:"Customer satisfaction",

message:
"Customer ratings require improvement."

});

}



// Check the condition (!alerts.length) and run the matching branch.
if(!alerts.length){

// Perform the side effect or state update expressed on the following line.
alerts.push({

priority:"low",

title:"Operations healthy",

message:
"No major operational risks detected."

});

}



// Declare healthScore for use by the surrounding module or function.
const healthScore =
Math.max(
0,
100 -
(pendingBookings * 2) -
((5-rating) * 10)
);



// Declare actions for use by the surrounding module or function.
const actions=[

"Review pending bookings daily.",

"Monitor payment completion rates.",

"Prepare transport resources before peak periods."

];



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

healthScore,

metrics:{

totalBookings,

pendingBookings,

confirmedBookings,

revenue:
revenue[0]?.total || 0,

availableVehicles:
vehicles,

totalTours,

customerRating:
rating

},


alerts,


recommendedActions:
actions

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
