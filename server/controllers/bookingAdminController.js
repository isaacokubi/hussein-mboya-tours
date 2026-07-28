// server/controllers/bookingAdminController.js


import Booking from "../models/Booking.js";




// ============================================================
// GET ALL BOOKINGS (ADMIN)
// ============================================================

export const getAllBookings = async (req, res) => {

try {


const bookings = await Booking.find()

.populate(
"customer",
"name email phone"
)

.populate(
"tour",
"title"
)

.sort({

createdAt:-1

});



res.status(200).json({

success:true,

count:bookings.length,

data:bookings

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// ALIAS FOR ROUTES USING getBookings
// ============================================================

export const getBookings = getAllBookings;









// ============================================================
// GET SINGLE BOOKING
// ============================================================

export const getBookingById = async(req,res)=>{


try {


const booking = await Booking.findById(

req.params.id

)

.populate(
"customer",
"name email phone"
)

.populate(
"tour",
"title"
);



if(!booking){


return res.status(404).json({

success:false,

message:"Booking not found"

});


}



res.status(200).json({

success:true,

data:booking

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// ALIAS FOR ROUTES USING getBooking
// ============================================================

export const getBooking = getBookingById;









// ============================================================
// UPDATE BOOKING STATUS
// ============================================================

export const updateBookingStatus = async(req,res)=>{


try {


const {

status

}=req.body;



const booking = await Booking.findByIdAndUpdate(

req.params.id,

{

status

},

{

new:true,

runValidators:true

}

);





if(!booking){


return res.status(404).json({

success:false,

message:"Booking not found"

});


}





res.status(200).json({

success:true,

message:"Booking status updated",

data:booking

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// DELETE BOOKING
// ============================================================

export const deleteBooking = async(req,res)=>{


try {


const booking = await Booking.findByIdAndDelete(

req.params.id

);





if(!booking){


return res.status(404).json({

success:false,

message:"Booking not found"

});


}





res.status(200).json({

success:true,

message:"Booking deleted successfully"

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// ASSIGN GUIDE DRIVER VEHICLE
// ============================================================

export const assignResources = async(req,res,next)=>{


try{


const booking = await Booking.findByIdAndUpdate(

req.params.id,


{


assignedGuide:req.body.guide || null,


assignedDriver:req.body.driver || null,


assignedVehicle:req.body.vehicle || null,


bookingStatus:"assigned"


},


{


new:true

}


);







if(!booking){


return res.status(404).json({

success:false,

message:"Booking not found"

});


}







res.status(200).json({

success:true,

message:"Resources assigned successfully",

booking

});


}
catch(error){


next(error);


}


};









// ============================================================
// UPDATE PAYMENT STATUS
// ============================================================

export const updatePaymentStatus = async(req,res)=>{


try{


const booking = await Booking.findByIdAndUpdate(

req.params.id,


{


paymentStatus:req.body.status,


mpesaReceipt:req.body.mpesaReceipt || ""


},


{


new:true

}


);






if(!booking){


return res.status(404).json({

success:false,

message:"Booking not found"

});


}






res.status(200).json({

success:true,

message:"Payment status updated",

data:booking

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};