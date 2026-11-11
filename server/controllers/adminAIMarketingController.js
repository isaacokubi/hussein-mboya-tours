/**
 * Purpose: admin AIMarketing Controller HTTP controller. Main declarations: generateAIMarketingCampaign.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";


// Declare generateAIMarketingCampaign for use by the surrounding module or function.
export const generateAIMarketingCampaign = async(
req,
res,
next
)=>{

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare [ tours, bookings, customers ] for use by the surrounding module or function.
const [

tours,

bookings,

customers

]=await Promise.all([


Tour.countDocuments(),


Booking.countDocuments(),


User.countDocuments({
role:"customer"
})


]);



// Declare campaigns for use by the surrounding module or function.
const campaigns=[

{

title:
"Africa Adventure Promotion",

audience:
"New travellers",

objective:
"Increase tour bookings",

offer:
"Early booking discount",

message:
"Explore unforgettable African destinations with our special travel offers."

},


{

title:
"Returning Customer Campaign",

audience:
"Previous customers",

objective:
"Increase repeat bookings",

offer:
"Loyalty travel reward",

message:
"Come back and discover another amazing African experience."

},


{

title:
"Low Season Growth Campaign",

audience:
"Budget travellers",

objective:
"Improve off-season sales",

offer:
"Limited seasonal packages",

message:
"Enjoy premium tours at special seasonal prices."

}

];



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

businessMetrics:{

tours,

bookings,

customers

},

campaigns

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
