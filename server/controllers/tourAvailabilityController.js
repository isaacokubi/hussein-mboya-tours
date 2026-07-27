import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";





/*
|--------------------------------------------------------------------------
| GET TOUR AVAILABILITY
|--------------------------------------------------------------------------
|
| Returns:
| - Total tour capacity
| - Already booked slots
| - Remaining available slots
|
|--------------------------------------------------------------------------
*/


export const getTourAvailability = async(
req,
res
)=>{


try{


const tour = await Tour.findById(

    req.params.id

);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}









const bookings = await Booking.aggregate([


{

$match:{


tour:tour._id,


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


totalGuests:{

$sum:"$guests"

}


}


}



]);









const bookedSlots =

bookings.length > 0

?

bookings[0].totalGuests

:

0;









const totalSlots =

tour.capacity || 0;








const availableSlots =

totalSlots - bookedSlots;








res.status(200).json({

success:true,


availability:{


tourId:tour._id,


tourName:tour.title,


totalSlots,


bookedSlots,


availableSlots



}



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
| UPDATE TOUR CAPACITY
|--------------------------------------------------------------------------
|
| Updates:
| - Tour capacity
| - Availability settings
|
|--------------------------------------------------------------------------
*/


export const updateTourAvailability = async(
req,
res
)=>{


try{


const {

totalSlots

}

=
req.body;








if(
!totalSlots ||
totalSlots <= 0
){


return res.status(400).json({

success:false,

message:
"Valid total slots are required"

});


}









const tour = await Tour.findByIdAndUpdate(

    req.params.id,


    {


        capacity:Number(totalSlots),


        "availabilitySettings.totalSlots":

        Number(totalSlots)



    },


    {


        new:true,


        runValidators:true


    }


)

.populate(

"destination"

)

.populate(

"guide"

)

.populate(

"vehicle"

);









if(!tour){


return res.status(404).json({

success:false,

message:
"Tour not found"

});


}









res.status(200).json({

success:true,


message:

"Tour capacity updated successfully",



tour


});





}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



};