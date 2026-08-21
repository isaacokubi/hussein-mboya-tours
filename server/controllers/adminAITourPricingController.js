import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";



export const getTourPricingAdvice = async(
req,
res,
next
)=>{

try{


const tours =
await Tour.find(tenantFilter(req))
.select(
"title price"
)
.lean();



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



const recommendations =
tours.map(tour=>{


const stats =
bookingStats.find(
item =>
String(item._id) ===
String(tour._id)
);



const bookings =
stats?.bookings || 0;



let action="Maintain current price";

let reason=
"Tour performance is stable.";



if(bookings >= 10){

action="Consider increasing price";

reason=
"High demand detected. Increase pricing gradually.";

}



if(bookings <= 2){

action="Create promotion";

reason=
"Low booking activity detected. Consider discounts or marketing.";

}



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



res.json({

success:true,

data:recommendations

});


}catch(error){

next(error);

}

};
