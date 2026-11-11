/**
 * Purpose: admin AISales Controller HTTP controller. Main declarations: getAISalesAssistant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";


// Declare getAISalesAssistant for use by the surrounding module or function.
export const getAISalesAssistant = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare [ totalBookings, completedBookings, customers, tours ] for use by the surrounding module or function.
const [

totalBookings,

completedBookings,

customers,

tours

]=await Promise.all([


Booking.countDocuments(),


Booking.countDocuments({
status:"confirmed"
}),


User.countDocuments({
role:"customer"
}),


Tour.find(tenantFilter(req))
.limit(10)
.select(
"title price destination"
)
.lean()


]);



// Declare conversionRate for use by the surrounding module or function.
const conversionRate =
totalBookings > 0
?
Number(
(
(completedBookings / totalBookings) * 100
).toFixed(1)
)
:
0;



// Declare recommendations for use by the surrounding module or function.
const recommendations=[];



// Check the condition (conversionRate < 30) and run the matching branch.
if(conversionRate < 30){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Improve follow-up speed for customer enquiries."
);

}


// Check the condition (customers > 0) and run the matching branch.
if(customers > 0){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Create loyalty offers for existing customers."
);

}


// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Promote high-value safari packages to increase revenue."
);



// Declare salesScripts for use by the surrounding module or function.
const salesScripts=[

{
title:"New Customer Reply",

message:
"Thank you for your interest. We can help you choose the perfect African adventure based on your budget and travel dates."
},


{
title:"Follow Up Message",

message:
"We noticed you were interested in our tours. Would you like us to prepare a personalized travel package?"
},


{
title:"Upsell Message",

message:
"Enhance your experience with airport transfers, accommodation and guided activities."
}

];



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

metrics:{

totalBookings,

confirmedBookings:
completedBookings,

customers,

conversionRate

},


recommendedTours:
tours,


recommendations,


salesScripts

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
