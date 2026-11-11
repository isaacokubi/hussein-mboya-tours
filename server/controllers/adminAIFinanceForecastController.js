/**
 * Purpose: admin AIFinance Forecast Controller HTTP controller. Main declarations: getAIFinancialForecast.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";


// Declare getAIFinancialForecast for use by the surrounding module or function.
export const getAIFinancialForecast = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare revenueHistory for use by the surrounding module or function.
const revenueHistory =
await Payment.aggregate([

{
$match:{
status:"completed"
}
},

{
$group:{

_id:{
month:{
$month:"$createdAt"
},
year:{
$year:"$createdAt"
}

},

revenue:{
$sum:"$amount"
}

}

},

{
$sort:{
"_id.year":1,
"_id.month":1
}
}

]);



// Declare bookingHistory for use by the surrounding module or function.
const bookingHistory =
await Booking.aggregate([

{
$group:{

_id:{
month:{
$month:"$createdAt"
},

year:{
$year:"$createdAt"
}

},

bookings:{
$sum:1
}

}

},

{
$sort:{
"_id.year":1,
"_id.month":1
}
}

]);



// Declare totalRevenue for use by the surrounding module or function.
const totalRevenue =
revenueHistory.reduce(
(sum,item)=>
sum + item.revenue,
0
);



// Declare totalBookings for use by the surrounding module or function.
const totalBookings =
bookingHistory.reduce(
(sum,item)=>
sum + item.bookings,
0
);



// Declare averageRevenue for use by the surrounding module or function.
const averageRevenue =
revenueHistory.length
?
Math.round(
totalRevenue / revenueHistory.length
)
:
0;



// Declare averageBookings for use by the surrounding module or function.
const averageBookings =
bookingHistory.length
?
Math.round(
totalBookings / bookingHistory.length
)
:
0;



// Declare forecast for use by the surrounding module or function.
const forecast = {

nextMonthRevenue:
averageRevenue,

nextMonthBookings:
averageBookings,

growthPotential:
averageRevenue > 0
?
"Positive"
:
"Insufficient data"

};



// Declare recommendations for use by the surrounding module or function.
const recommendations=[];



// Check the condition (averageBookings > 0) and run the matching branch.
if(averageBookings > 0){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Prepare resources based on expected booking demand."
);

}



// Check the condition (averageRevenue < 100000) and run the matching branch.
if(averageRevenue < 100000){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Consider marketing campaigns to increase revenue."
);

}



// Check the condition (!recommendations.length) and run the matching branch.
if(!recommendations.length){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Continue monitoring financial performance."
);

}



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

history:{

revenueHistory,

bookingHistory

},

forecast,

recommendations

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};
