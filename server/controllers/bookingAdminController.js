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
// GET SINGLE BOOKING
// ============================================================

export const getBookingById = async(req,res)=>{

try {


const booking =
await Booking.findById(
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



res.json({

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
// UPDATE BOOKING STATUS
// ============================================================

export const updateBookingStatus = async(req,res)=>{

try {


const {
status
}
=
req.body;



const booking =
await Booking.findByIdAndUpdate(

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



res.json({

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


const booking =
await Booking.findByIdAndDelete(
req.params.id
);



if(!booking){

return res.status(404).json({

success:false,

message:"Booking not found"

});

}



res.json({

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