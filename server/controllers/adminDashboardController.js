import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";



export const getDashboard = async (req, res) => {

    try {


        /*
        |--------------------------------------------------------------------------
        | BASIC COUNTS
        |--------------------------------------------------------------------------
        */


        const users =
            await User.countDocuments();



        const tours =
            await Tour.countDocuments();



        const bookings =
            await Booking.countDocuments();



        const destinations =
            await Destination.countDocuments();






        /*
        |--------------------------------------------------------------------------
        | REVENUE FROM PAYMENTS
        |--------------------------------------------------------------------------
        */


        let revenue = 0;



        const paymentRevenue =
            await Payment.aggregate([


                {
                    $match: {

                        status: {

                            $in: [
                                "completed",
                                "paid",
                                "success"
                            ]

                        }

                    }

                },


                {
                    $group: {

                        _id:null,


                        total:{

                            $sum:"$amount"

                        }

                    }

                }


            ]);



        revenue =
            paymentRevenue[0]?.total || 0;








        /*
        |--------------------------------------------------------------------------
        | FALLBACK REVENUE FROM BOOKINGS
        |--------------------------------------------------------------------------
        */


        if(revenue === 0){


            const bookingRevenue =
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

                                $sum:{
                                    $ifNull:[
                                        "$amount",
                                        "$totalAmount"
                                    ]
                                }

                            }

                        }

                    }


                ]);



            revenue =
                bookingRevenue[0]?.total || 0;


        }









        /*
        |--------------------------------------------------------------------------
        | PAYMENT STATUS
        |--------------------------------------------------------------------------
        */


        const payments = {


            paid:

                await Payment.countDocuments({

                    status:{
                        $in:[
                            "paid",
                            "completed",
                            "success"
                        ]
                    }

                }),



            pending:

                await Payment.countDocuments({

                    status:"pending"

                }),



            failed:

                await Payment.countDocuments({

                    status:"failed"

                })


        };









        /*
        |--------------------------------------------------------------------------
        | BOOKING STATUS
        |--------------------------------------------------------------------------
        */


        const bookingStatus =

            await Booking.aggregate([


                {

                    $group:{


                        _id:{


                            bookingStatus:
                                "$bookingStatus",



                            paymentStatus:
                                "$paymentStatus"


                        },


                        count:{

                            $sum:1

                        }


                    }

                }


            ]);









        /*
        |--------------------------------------------------------------------------
        | POPULAR TOURS
        |--------------------------------------------------------------------------
        */


        const popularTours =

            await Booking.aggregate([


                {


                    $group:{


                        _id:"$tour",



                        totalBookings:{

                            $sum:1

                        },



                        revenue:{


                            $sum:{

                                $ifNull:[

                                    "$amount",

                                    "$totalAmount"

                                ]

                            }


                        }


                    }


                },



                {


                    $lookup:{


                        from:"tours",


                        localField:"_id",


                        foreignField:"_id",


                        as:"tour"


                    }


                },



                {


                    $unwind:"$tour"


                },



                {


                    $project:{


                        title:
                            "$tour.title",


                        totalBookings:1,


                        revenue:1


                    }


                },



                {


                    $sort:{


                        totalBookings:-1


                    }


                },



                {


                    $limit:5


                }


            ]);









        /*
        |--------------------------------------------------------------------------
        | RECENT BOOKINGS
        |--------------------------------------------------------------------------
        */


        const recentBookings =

            await Booking.find()


                .populate(
                    "tour",
                    "title"
                )


                .populate(
                    "user",
                    "name email"
                )


                .populate(
                    "customer",
                    "name email"
                )


                .sort({

                    createdAt:-1

                })


                .limit(10)


                .lean();









        /*
        |--------------------------------------------------------------------------
        | NORMALIZE PAYMENT STATUS
        |--------------------------------------------------------------------------
        */


        const normalizedRecentBookings =

            recentBookings.map(
                
                (booking)=>({

                    ...booking,


                    paymentStatus:

                        typeof booking.paymentStatus === "object"

                        ?

                        (

                            booking.paymentStatus.paymentStatus ||

                            booking.paymentStatus.status ||

                            "pending"

                        )

                        :

                        booking.paymentStatus || "pending"


                })

            );









        /*
        |--------------------------------------------------------------------------
        | USER GROUPS
        |--------------------------------------------------------------------------
        */


        const customers =

            await User.countDocuments({

                role:"customer"

            });







        const agents =

            await User.find({

                role:"agent"

            })

            .select(
                "name email"
            );








        const guides =

            await User.find({

                role:{

                    $in:[

                        "tour_guide",
                        "tourguide",
                        "Tour Guide"

                    ]

                }

            })

            .select(
                "name email"
            );









        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */


        const notifications =

            await Notification.find()

                .sort({

                    createdAt:-1

                })

                .limit(5);









        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */


        res.status(200).json({


            success:true,


            data:{


                users,


                tours,


                bookings,


                destinations,



                revenue,




                paymentStats:{


                    completed:
                        payments.paid,


                    pending:
                        payments.pending,


                    failed:
                        payments.failed


                },




                bookingStatus,




                popularTours,




                recentBookings:
                    normalizedRecentBookings,




                notifications,




                userStats:{


                    customers,



                    agents:
                        agents.length,



                    guides:
                        guides.length


                }




            }



        });



    }



    catch(error){


        console.error(
            "Dashboard Error:",
            error
        );



        res.status(500).json({


            success:false,


            message:error.message


        });


    }


};