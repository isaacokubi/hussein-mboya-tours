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

const validateTourCapacity = async (
    tourId,
    requestedGuests
) => {


    const bookings = await Booking.aggregate([

        {
            $match: {

                tour: tourId,

                bookingStatus: {

                    $in: [

                        "pending",
                        "confirmed"

                    ]

                }

            }

        },


        {

            $group: {

                _id:null,

                bookedGuests: {

                    $sum:"$travelerCount"

                }

            }

        }

    ]);



    const bookedGuests = bookings.length

        ? bookings[0].bookedGuests

        : 0;




    const tour = await Tour.findById(
        tourId
    );



    if(!tour){

        throw new Error(
            "Tour not found"
        );

    }



    return (

        bookedGuests + requestedGuests

        <=

        tour.capacity

    );


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

            paymentMethod,

            amount

        } = req.body;





        const tourData = await Tour.findById(
            tour
        );



        if(!tourData){

            return res.status(404).json({

                success:false,

                message:"Tour not found"

            });

        }





        const travelerCount =

            travelers?.length || 1;





        const available = await validateTourCapacity(

            tour,

            travelerCount

        );




        if(!available){

            return res.status(400).json({

                success:false,

                message:"No available slots"

            });

        }





        const subtotal =

            tourData.price *

            travelerCount;





        let discountAmount = 0;



        if(tourData.discount){

            discountAmount =

                (

                    subtotal *

                    tourData.discount

                )

                /

                100;

        }





        const finalAmount =

            amount ||

            subtotal - discountAmount;





        const depositAmount =

            tourData.depositRequired || 0;





        const balanceAmount =

            finalAmount -

            depositAmount;





        const booking = await Booking.create({

            user:req.user?._id || null,

            tour,

            travelers,

            travelerCount,

            travelDate,

            contact,

            subtotal,

            discountAmount,

            amount:finalAmount,

            depositAmount,

            balanceAmount,

            paymentMethod:

                paymentMethod || "MPESA",

            paymentStatus:"pending",

            bookingStatus:"pending"

        });





        await reserveSlots(

            tour,

            travelerCount

        );





        const populatedBooking = await Booking.findById(

            booking._id

        )

        .populate("tour")

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
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async(

    req,

    res,

    next

)=>{


    try{


        const bookings = await Booking.find({

            user:req.user._id

        })

        .populate("tour")

        .sort({

            createdAt:-1

        });




        res.json({

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
| GET ALL BOOKINGS ADMIN
|--------------------------------------------------------------------------
*/

export const getAllBookings = async(

    req,

    res,

    next

)=>{


    try{


        const bookings = await Booking.find()

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





        res.json({

            success:true,

            count:bookings.length,

            bookings

        });



    }

    catch(error){

        next(error);

    }


};





// Old route compatibility
export const getBookings = getAllBookings;









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


        const booking = await Booking.findById(

            req.params.id

        )

        .populate("tour")

        .populate(

            "user",

            "name email"

        );





        if(!booking){

            return res.status(404).json({

                success:false,

                message:"Booking not found"

            });

        }





        res.json({

            success:true,

            booking

        });



    }

    catch(error){

        next(error);

    }


};




// Route compatibility
export const getBooking = getBookingById;









/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingPayment = async(

    bookingId,

    status

)=>{


    const booking = await Booking.findById(

        bookingId

    );



    if(!booking){

        throw new Error(
            "Booking not found"
        );

    }



    booking.paymentStatus = status;



    if(status === "paid"){

        booking.bookingStatus = "confirmed";

    }



    await booking.save();



    return booking;


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


        const booking = await Booking.findById(

            req.params.id

        );



        if(!booking){

            return res.status(404).json({

                success:false,

                message:"Booking not found"

            });

        }





        booking.bookingStatus =

            req.body.bookingStatus ||

            booking.bookingStatus;



        booking.paymentStatus =

            req.body.paymentStatus ||

            booking.paymentStatus;





        await booking.save();





        res.json({

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

    res,

    next

)=>{


    try{


        const booking = await Booking.findById(

            req.params.id

        );



        if(!booking){

            return res.status(404).json({

                success:false,

                message:"Booking not found"

            });

        }





        booking.bookingStatus = "cancelled";



        await booking.save();





        res.json({

            success:true,

            message:"Booking cancelled successfully",

            booking

        });



    }

    catch(error){

        next(error);

    }


};