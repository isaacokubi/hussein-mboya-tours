import mongoose from "mongoose";

import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";





/*
|--------------------------------------------------------------------------
| TOUR MANAGER DASHBOARD
|--------------------------------------------------------------------------
*/


export const getTourManagerDashboard = async (
    req,
    res
) => {


    try {


        /*
        |--------------------------------------------------------------------------
        | TOTAL TOURS
        |--------------------------------------------------------------------------
        */


        const totalTours =
            await Tour.countDocuments();






        /*
        |--------------------------------------------------------------------------
        | UPCOMING TOURS
        |--------------------------------------------------------------------------
        */


        const upcomingTours =

            await Tour.find({

                date:{
                    $gte:new Date()
                },


                status:{
                    $in:[
                        "upcoming",
                        "ongoing"
                    ]
                }

            })

            .populate(

                "guide",

                "name email"

            )


            .populate(

                "vehicle",

                "name registration type driver"

            )


            .sort({

                date:1

            })


            .limit(10);









        /*
        |--------------------------------------------------------------------------
        | TOTAL CUSTOMERS
        |--------------------------------------------------------------------------
        */


        const customerRole = await mongoose
            .model("Role")
            .findOne({

                name:"customer"

            });



        const totalCustomers = customerRole

            ?

            await User.countDocuments({

                role:customerRole._id

            })

            :

            0;









        /*
        |--------------------------------------------------------------------------
        | REVENUE
        |--------------------------------------------------------------------------
        */


        const revenueResult =

            await Booking.aggregate([


                {


                    $match:{


                        paymentStatus:"paid"


                    }


                },



                {


                    $group:{


                        _id:null,


                        total:{


                            $sum:"$totalAmount"


                        }


                    }


                }



            ]);





        const revenue =

            revenueResult.length

            ?

            revenueResult[0].total

            :

            0;









        /*
        |--------------------------------------------------------------------------
        | FORMAT UPCOMING TOURS
        |--------------------------------------------------------------------------
        */


        const formattedTours =


            upcomingTours.map(

                tour => ({


                    id:
                    tour._id,



                    name:

                    tour.title,



                    date:

                    tour.date

                    ?

                    new Date(

                        tour.date

                    )

                    .toLocaleDateString(

                        "en-GB",

                        {

                            day:"numeric",

                            month:"long",

                            year:"numeric"

                        }

                    )

                    :

                    "No date",





                    guests:

                    tour.capacity || 0,





                    guide:

                    tour.guide

                    ?

                    tour.guide.name

                    :

                    "Not Assigned",





                    vehicle:

                    tour.vehicle

                    ?

                    tour.vehicle.registration ||

                      tour.vehicle.name ||

                      "Assigned"

                    :

                    "Not Assigned",





                    status:

                    tour.status || "upcoming"



                })

            );









        /*
        |--------------------------------------------------------------------------
        | RECENT BOOKINGS
        |--------------------------------------------------------------------------
        */


        const recentBookings =

            await Booking.find()


            .populate(

                "customer",

                "name email"

            )


            .populate(

                "tour",

                "title"

            )


            .sort({

                createdAt:-1

            })


            .limit(6);









        const formattedBookings =


            recentBookings.map(

                booking => ({


                    id:

                    booking._id,




                    customer:

                    booking.customer

                    ?

                    booking.customer.name

                    :

                    booking.customerSnapshot?.name ||

                    "Unknown",





                    tour:

                    booking.tour

                    ?

                    booking.tour.title

                    :

                    "Unknown",





                    guests:

                    booking.guests ||

                    booking.travelerCount ||

                    0,





                    payment:

                    booking.paymentStatus ||

                    "pending",





                    amount:

                    booking.totalAmount ||

                    booking.amount ||

                    0



                })

            );










        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */


        res.status(200)
        .json({


            success:true,



            stats:{


                totalTours,



                upcomingTours:

                upcomingTours.length,



                totalCustomers,



                revenue



            },




            upcomingTours:

            formattedTours,





            recentBookings:

            formattedBookings



        });






    }


    catch(error){



        console.error(

            "Tour Manager Dashboard Error:",

            error

        );



        res.status(500)
        .json({


            success:false,


            message:

            "Unable to load dashboard",



            error:

            error.message



        });



    }


};









/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/


export const createTour = async(
req,
res
)=>{


    try{


        const tour =

            await Tour.create({

                ...req.body,

                createdBy:req.user._id

            });



        res.status(201)
        .json({

            success:true,

            tour

        });



    }


    catch(error){


        res.status(500)
        .json({


            success:false,


            message:error.message


        });


    }


};









/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/


export const getTours = async(
req,
res
)=>{


    try{


        const tours =

            await Tour.find()


            .populate(

                "guide",

                "name email"

            )


            .populate(

                "vehicle",

                "name registration type"

            )


            .populate(

                "createdBy",

                "name email"

            );



        res.status(200)
        .json({

            success:true,

            tours

        });



    }


    catch(error){


        res.status(500)
        .json({

            success:false,

            message:error.message

        });


    }


};









/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/


export const updateTour = async(
req,
res
)=>{


    try{


        const tour =

            await Tour.findByIdAndUpdate(

                req.params.id,

                req.body,

                {

                    new:true,

                    runValidators:true

                }

            );



        if(!tour){


            return res.status(404)
            .json({

                success:false,

                message:"Tour not found"

            });


        }



        res.status(200)
        .json({

            success:true,

            tour

        });



    }


    catch(error){


        res.status(500)
        .json({

            success:false,

            message:error.message

        });


    }


};









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/


export const deleteTour = async(
req,
res
)=>{


    try{


        const tour =

            await Tour.findByIdAndDelete(

                req.params.id

            );



        if(!tour){


            return res.status(404)
            .json({

                success:false,

                message:"Tour not found"

            });


        }



        res.status(200)
        .json({

            success:true,

            message:"Tour deleted successfully"

        });



    }


    catch(error){


        res.status(500)
        .json({

            success:false,

            message:error.message

        });


    }


};