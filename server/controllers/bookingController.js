import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

import {
    reserveSlots
} from "../services/inventoryService.js";





/*
|--------------------------------------------------------------------------
| CHECK TOUR CAPACITY
|--------------------------------------------------------------------------
*/

const validateTourCapacity = async(
    tourId,
    requestedGuests
)=>{


    const bookings = await Booking.aggregate([

        {
            $match:{

                tour:tourId,

                bookingStatus:{

                    $in:[

                        "pending",

                        "confirmed"

                    ]

                }

            }

        },

        {

            $group:{

                _id:null,

                bookedGuests:{

                    $sum:"$travelerCount"

                }

            }

        }


    ]);





    const bookedGuests =

    bookings.length

    ?

    bookings[0].bookedGuests

    :

    0;





    const tour =

    await Tour.findById(
        tourId
    );





    if(!tour){

        throw new Error(
            "Tour not found"
        );

    }





    if(

        bookedGuests + requestedGuests

        >

        tour.capacity

    ){

        return false;

    }





    return true;


};









/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async(
req,
res,
next
)=>{


try{


const {

    tour,

    travelDate,

    travelers,

    contact,

    paymentMethod


}=req.body;







const tourData =

await Tour.findById(
    tour
);







if(!tourData){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







const travelerCount =

travelers.length;








const available =

await validateTourCapacity(

    tour,

    travelerCount

);







if(!available){


return res.status(400).json({

    success:false,

    message:
    "No available slots"

});


}







const subtotal =

tourData.price *

travelerCount;







let discountAmount = 0;







if(tourData.discount){


discountAmount =

(
    tourData.discount / 100
)

*

subtotal;


}








if(

tourData.pricingRules &&

tourData.pricingRules.length

){


tourData.pricingRules.forEach(

(rule)=>{


if(

travelerCount >= rule.minTravelers

){


const discount =

(
    rule.discount / 100
)

*

subtotal;





if(

discount >

discountAmount

){


discountAmount = discount;


}


}


}


);


}








const amount =

subtotal -

discountAmount;








const depositAmount =

tourData.depositRequired || 0;







const balanceAmount =

amount -

depositAmount;







const booking =

await Booking.create({

    user:req.user._id,

    tour,

    travelers,

    travelerCount,

    travelDate,

    contact,

    subtotal,

    discountAmount,

    amount,

    depositAmount,

    balanceAmount,

    paymentMethod,

    paymentStatus:"pending",

    bookingStatus:"pending"

});







await reserveSlots(

    tour,

    travelerCount

);








const populatedBooking =

await Booking.findById(

    booking._id

)

.populate({

    path:"tour",

    populate:{

        path:"destination"

    }

})

.populate(

    "user",

    "-password"

);







res.status(201).json({

    success:true,

    booking:populatedBooking

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async(
req,
res,
next
)=>{


try{


const booking =

await Booking.findById(

    req.params.id

);







if(!booking){


return res.status(404).json({

    success:false,

    message:
    "Booking not found"

});


}








if(

req.body.bookingStatus === "confirmed"

){



const available =

await validateTourCapacity(

    booking.tour,

    booking.travelerCount

);







if(!available){


return res.status(400).json({

    success:false,

    message:
    "Tour capacity exceeded"

});


}


}








booking.bookingStatus =

req.body.bookingStatus;








if(req.body.paymentStatus){


booking.paymentStatus =

req.body.paymentStatus;


}







await booking.save();







res.status(200).json({

    success:true,

    booking

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking = async(
req,
res
)=>{


try{


const booking =

await Booking.findById(

    req.params.id

);







if(!booking){


return res.status(404).json({

    success:false,

    message:
    "Booking not found"

});


}







booking.bookingStatus =

"cancelled";







await booking.save();







res.status(200).json({

    success:true,

    message:
    "Booking cancelled successfully",

    booking

});


}


catch(error){


res.status(500).json({

    success:false,

    message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/

export const getBookings = async(
req,
res,
next
)=>{


try{


const bookings =

await Booking.find()

.populate(

    "user",

    "name email"

)

.populate(

    "tour"

)

.sort({

    createdAt:-1

});







res.status(200).json({

    success:true,

    count:bookings.length,

    bookings

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async(
req,
res,
next
)=>{


try{


const bookings =

await Booking.find({

    user:req.user._id

})

.populate(

    "tour"

)

.sort({

    createdAt:-1

});







res.status(200).json({

    success:true,

    count:bookings.length,

    bookings

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS ADMIN / MANAGER
|--------------------------------------------------------------------------
*/

export const getAllBookings = async(
req,
res,
next
)=>{


try{


const bookings =

await Booking.find()

.populate(

    "user",

    "name email"

)

.populate(

    "tour"

)

.sort({

    createdAt:-1

});







res.status(200).json({

    success:true,

    count:bookings.length,

    bookings

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBookingById = async(
req,
res,
next
)=>{


try{


const booking =

await Booking.findById(

    req.params.id

)

.populate(

    "user",

    "name email"

)

.populate(

    "tour"

);







if(!booking){


return res.status(404).json({

    success:false,

    message:
    "Booking not found"

});


}







res.status(200).json({

    success:true,

    booking

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING ALIAS
|--------------------------------------------------------------------------
*/

export const getBooking = async(
req,
res,
next
)=>{


try{


const booking =

await Booking.findById(

    req.params.id

)

.populate(

    "user",

    "name email"

)

.populate(

    "tour"

);







if(!booking){


return res.status(404).json({

    success:false,

    message:
    "Booking not found"

});


}







res.status(200).json({

    success:true,

    booking

});


}


catch(error){

next(error);

}


};