import { mergeTenantFilter } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";


export const generateAIMarketingCampaign = async(
req,
res,
next
)=>{

try{


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

next(error);

}

};
