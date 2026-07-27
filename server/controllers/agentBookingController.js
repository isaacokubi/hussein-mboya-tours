import Booking from "../models/Booking.js";

import TourPackage from "../models/TourPackage.js";

import Customer from "../models/Customer.js";

import Agent from "../models/Agent.js";

import {
createCommission
}
from "../services/commissionService.js";





/*
|--------------------------------------------------------------------------
| CREATE AGENT BOOKING
|--------------------------------------------------------------------------
|
| Agent selects a Tour Package.
| Price comes from database.
| Agent cannot edit price.
|
*/


export const createBooking = async(req,res)=>{


try{


const agentUserId = req.user._id;



const agentProfile =
await Agent.findOne({

user:agentUserId

});



if(!agentProfile){

return res.status(404)
.json({

message:"Agent profile not found"

});

}




const {


customer,

tour,

travelDate,

travelers


}

=
req.body;







const tourPackage =

await TourPackage.findById(
tour
);





if(!tourPackage){


return res.status(404)
.json({

message:"Tour package not found"

});


}








const customerData =

await Customer.findById(
customer
);





if(!customerData){


return res.status(404)
.json({

message:"Customer not found"

});


}









const travelerCount =

travelers.length;








/*
|--------------------------------------------------------------------------
| CALCULATE PRICE
|--------------------------------------------------------------------------
*/


const totalAmount =

tourPackage.price *

travelerCount;









/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/


const booking =

await Booking.create({

agent:agentProfile._id,


user:customerData.user || null,



customerSnapshot:{


name:
customerData.name,


email:
customerData.email,


phone:
customerData.phone


},



bookingSource:"agent",



contact:{


name:
customerData.name,


email:
customerData.email,


phone:
customerData.phone


},




tour:
tourPackage._id,



travelDate,



travelers,



travelerCount,



subtotal:
totalAmount,



amount:
totalAmount,



commissionRate:
agentProfile.commissionRate


});









/*
|--------------------------------------------------------------------------
| CREATE COMMISSION
|--------------------------------------------------------------------------
*/


await createCommission(

booking

);







res.status(201)
.json({

success:true,

booking

});




}

catch(error){


console.error(
error
);


res.status(500)
.json({

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| GET AGENT BOOKINGS
|--------------------------------------------------------------------------
*/


export const getAgentBookings =

async(req,res)=>{


try{


const agentProfile =

await Agent.findOne({

user:req.user._id

});





const bookings =

await Booking.find({

agent:agentProfile._id

})


.populate(

"tour"

)


.populate(

"user"

)


.sort({

createdAt:-1

});







res.json({

success:true,

bookings

});



}

catch(error){


res.status(500)
.json({

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/


export const updateBookingStatus =

async(req,res)=>{


try{


const {

status

}

=
req.body;






const agentProfile =

await Agent.findOne({

user:req.user._id

});







const booking =

await Booking.findOneAndUpdate(

{


_id:req.params.id,


agent:agentProfile._id


},


{


bookingStatus:status


},


{


new:true

}


);







if(!booking){


return res.status(404)
.json({

message:"Booking not found"

});


}







res.json({

success:true,

booking

});





}

catch(error){


res.status(500)
.json({

message:error.message

});


}


};