import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";
import Tour from "../models/Tour.js";


export const getAIOperationsCenter = async(
req,
res,
next
)=>{

try{


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



const rating =
reviews[0]?.average
?
Number(
reviews[0].average.toFixed(1)
)
:
0;



const alerts=[];



if(pendingBookings > 10){

alerts.push({

priority:"high",

title:"Booking backlog",

message:
`${pendingBookings} bookings require attention.`

});

}



if(vehicles < 3){

alerts.push({

priority:"medium",

title:"Vehicle availability",

message:
"Vehicle capacity may affect upcoming tours."

});

}



if(rating < 4){

alerts.push({

priority:"medium",

title:"Customer satisfaction",

message:
"Customer ratings require improvement."

});

}



if(!alerts.length){

alerts.push({

priority:"low",

title:"Operations healthy",

message:
"No major operational risks detected."

});

}



const healthScore =
Math.max(
0,
100 -
(pendingBookings * 2) -
((5-rating) * 10)
);



const actions=[

"Review pending bookings daily.",

"Monitor payment completion rates.",

"Prepare transport resources before peak periods."

];



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

next(error);

}

};
