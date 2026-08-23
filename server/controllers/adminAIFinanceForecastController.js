import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";


export const getAIFinancialForecast = async(
req,
res,
next
)=>{
  requireTenantId();

try{


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



const totalRevenue =
revenueHistory.reduce(
(sum,item)=>
sum + item.revenue,
0
);



const totalBookings =
bookingHistory.reduce(
(sum,item)=>
sum + item.bookings,
0
);



const averageRevenue =
revenueHistory.length
?
Math.round(
totalRevenue / revenueHistory.length
)
:
0;



const averageBookings =
bookingHistory.length
?
Math.round(
totalBookings / bookingHistory.length
)
:
0;



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



const recommendations=[];



if(averageBookings > 0){

recommendations.push(
"Prepare resources based on expected booking demand."
);

}



if(averageRevenue < 100000){

recommendations.push(
"Consider marketing campaigns to increase revenue."
);

}



if(!recommendations.length){

recommendations.push(
"Continue monitoring financial performance."
);

}



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

next(error);

}

};
