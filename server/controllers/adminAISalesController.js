import { mergeTenantFilter } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";


export const getAISalesAssistant = async(
req,
res,
next
)=>{

try{


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



const recommendations=[];



if(conversionRate < 30){

recommendations.push(
"Improve follow-up speed for customer enquiries."
);

}


if(customers > 0){

recommendations.push(
"Create loyalty offers for existing customers."
);

}


recommendations.push(
"Promote high-value safari packages to increase revenue."
);



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

next(error);

}

};
