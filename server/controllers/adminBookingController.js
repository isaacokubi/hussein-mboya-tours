import Booking from "../models/Booking.js";


export const getAllBookings =
async(req,res,next)=>{

try{


const bookings =
await Booking.find()

.populate(
"user",
"name email phone"
)

.populate(
"tour",
"title price"
)

.sort({
createdAt:-1
});


res.json(bookings);


}
catch(error){

next(error);

}

};



export const updateBookingStatus =
async(req,res,next)=>{


try{


const booking =
await Booking.findById(
req.params.id
);



booking.bookingStatus =
req.body.status;



await booking.save();



res.json({

message:
"Booking updated",

booking

});


}
catch(error){

next(error);

}

};